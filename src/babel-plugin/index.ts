import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import * as Babel from '@babel/core'
import propertyPathToIdentifier from '../core/property-path-to-identifier'
import annotateAsPure from '@babel/helper-annotate-as-pure'

type Options = {
	translationFiles: string[]
}

type VisitorState = {
	filename: string
	opts: Options
	cwd: any
}

const declarations: t.ExportNamedDeclaration[] = []
// TODO: Take from config.
const languages = ['fi']

export default function(): Babel.PluginObj<VisitorState> {
	return {
		name: 'translation-compiler',
		visitor: {
			ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>, state: VisitorState) {
				if (!isTranslationFile(state)) return
				const declaration = path.get('declaration')

				if (!t.isObjectExpression(declaration.node)) {
					throw path.buildCodeFrameError(
						'Translation file must have a default expression that is an object containing' +
							'the translation keys.',
					)
				}
				const properties = declaration.get('properties') as NodePath[]
				visitObjectDeclarationProperties(properties, [])
				path.replaceWithMultiple(declarations)
			},
			CallExpression(path, state) {
				if (!isTranslationFile(state)) return
				annotateAsPure(path)
			},
		},
	}
}

function isTranslationFile(state: VisitorState): boolean {
	// TODO: More flexible way to define translation files.
	return state.opts.translationFiles.includes(state.filename)
}

function visitObjectDeclarationProperties(properties: NodePath[], path: string[]) {
	for (const prop of properties) {
		if (prop.isObjectProperty()) {
			const key = prop.node.key
			if (!t.isIdentifier(key)) {
				throw prop.buildCodeFrameError('Translation object keys must be simple identifiers')
			}
			const newPath = [key.name, ...path]
			visitTranslationObject(prop.get('value') as NodePath<t.Node>, newPath)
		} else {
			throw prop.buildCodeFrameError(
				'Translation object keys can only be translation definitions, declared with t(..),' +
					' or nested objects containing the translation objects.',
			)
		}
	}
}

function visitTranslationObject(objectPropertyValue: NodePath<t.Node>, path: string[]) {
	if (objectPropertyValue.isObjectExpression()) {
		const properties = objectPropertyValue.get('properties') as NodePath[]
		return visitObjectDeclarationProperties(properties, path)
	}
	// TODO: Check that it's the right kind of call expression.
	if (objectPropertyValue.isCallExpression()) {
		// TODO: Other languages.
		const translationExpr = objectPropertyValue.get('arguments')[0]

		for (const language of languages) {
			const exportableId = propertyPathToIdentifier(path, 'fi')
			if (translationExpr.isArrowFunctionExpression() || translationExpr.isFunctionExpression()) {
				unwrapTranslationFunction(translationExpr, language)
			} else if (translationExpr.isObjectExpression()) {
				unwrapTranslationObject(translationExpr, language)
			} else {
				throw objectPropertyValue.buildCodeFrameError(
					'Translation factory function t(..) should be called with' +
						' a translation object or a function that returns the object.',
				)
			}

			// Move translation to an export declaration.
			// The top level default export will be replaced with these later.
			declarations.push(
				t.exportNamedDeclaration(
					t.variableDeclaration('const', [
						t.variableDeclarator(exportableId, translationExpr.node),
					]),
					[],
				),
			)
		}
	}
}

const expectedTranslationObjectMsg =
	'simple object describing {language: "translation string"} pairings'

function unwrapTranslationObject(translationExpr: NodePath<t.ObjectExpression>, language: string) {
	const prop = translationExpr.get('properties').find(prop => {
		const keysShouldBeSimpleErrorMsg = `Translation object properties should be ${expectedTranslationObjectMsg}.`
		if (!prop.isObjectProperty()) {
			throw prop.buildCodeFrameError(keysShouldBeSimpleErrorMsg)
		}
		const key = prop.get('key')
		if (Array.isArray(key) || !key.isIdentifier()) {
			// TODO: Should use `key` to build the frame.
			throw prop.buildCodeFrameError(keysShouldBeSimpleErrorMsg)
		}

		return key.node.name === language
	})
	if (!prop) {
		// TODO: Allow omitting languages with predefined default languages
		throw translationExpr.buildCodeFrameError(
			`Can't find language ${language} from translation keys.`,
		)
	}
	const value = prop.get('value') as NodePath<t.Node>
	translationExpr.replaceWith(value)
}

function unwrapTranslationFunction(
	translationExpr: NodePath<t.FunctionExpression> | NodePath<t.ArrowFunctionExpression>,
	language: string,
) {
	const returnTypeErrorMsg =
		'Translation factory function must return' +
		` a translation object with ${expectedTranslationObjectMsg}.`

	const body: NodePath<t.Node> = translationExpr.get('body')
	if (body.isBlockStatement()) {
		const returnStatements: NodePath<t.ReturnStatement>[] = body
			.get('body')
			.filter(isPathReturnStatement)
		if (!returnStatements.length) {
			throw body.buildCodeFrameError(returnTypeErrorMsg)
		}
		for (const rs of returnStatements) {
			const arg = rs.get('argument')
			if (!arg.isObjectExpression()) {
				throw arg.buildCodeFrameError(returnTypeErrorMsg)
			}

			unwrapTranslationObject(arg, language)
		}
	} else if (body.isObjectExpression()) {
		unwrapTranslationObject(body, language)
	} else {
		throw body.buildCodeFrameError(returnTypeErrorMsg)
	}
}

function isPathReturnStatement(path: NodePath<t.Statement>): path is NodePath<t.ReturnStatement> {
	return path.isReturnStatement()
}
