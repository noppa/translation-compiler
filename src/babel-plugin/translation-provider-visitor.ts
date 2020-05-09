import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import propertyPathToIdentifier from '../core/property-path-to-identifier'
import {
	VisitorState,
	TranslationProviderState,
	isVisitingTranslationProvider,
	str,
} from '../core/visitor-utils'

export function ExportDefaultDeclaration(
	path: NodePath<t.ExportDefaultDeclaration>,
	state: VisitorState,
) {
	if (!isVisitingTranslationProvider(state)) return
	if (!state.declarations) state.declarations = []

	const declaration = path.get('declaration')

	if (!t.isObjectExpression(declaration.node)) {
		throw path.buildCodeFrameError(
			str(
				'Translation file must have a default expression that is an object containing',
				'the translation keys.',
			),
		)
	}
	const properties = declaration.get('properties') as NodePath[]
	visitObjectDeclarationProperties(properties, [], state)
	path.replaceWithMultiple(state.declarations)
}

function visitObjectDeclarationProperties(
	properties: NodePath[],
	path: string[],
	state: TranslationProviderState,
) {
	for (const prop of properties) {
		if (prop.isObjectProperty()) {
			const key = prop.node.key
			if (!t.isIdentifier(key)) {
				throw prop.buildCodeFrameError('Translation object keys must be simple identifiers')
			}
			const newPath = [key.name, ...path]
			visitTranslationObject(prop.get('value') as NodePath<t.Node>, newPath, state)
		} else {
			throw prop.buildCodeFrameError(
				str(
					'Translation object keys can only be translation definitions, declared with t(..),',
					'or nested objects containing the translation objects.',
				),
			)
		}
	}
}

function visitTranslationObject(
	objectPropertyValue: NodePath<t.Node>,
	path: string[],
	state: TranslationProviderState,
) {
	if (objectPropertyValue.isObjectExpression()) {
		const properties = objectPropertyValue.get('properties') as NodePath[]
		return visitObjectDeclarationProperties(properties, path, state)
	}
	// TODO: Check that it's the right kind of call expression.
	if (objectPropertyValue.isCallExpression()) {
		// TODO: Other languages.
		const translationExpr = objectPropertyValue.get('arguments')[0]

		// BUG: This breaks with multiple languages!! Don't mutate the tree, create clones.
		for (const language of state.opts.languages) {
			const exportableId = propertyPathToIdentifier([...path].reverse(), 'fi')
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
			state.declarations.push(
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

const translationObjectShouldBe =
	'simple object describing {language: "translation string"} pairings'

function unwrapTranslationObject(translationExpr: NodePath<t.ObjectExpression>, language: string) {
	const prop = translationExpr.get('properties').find((prop) => {
		const keysShouldBeSimpleErrorMsg = `Translation object properties should be ${translationObjectShouldBe}.`
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
	const returnTypeErrorMsg = str(
		'Translation factory function must return',
		`a translation object with ${translationObjectShouldBe}.`,
	)

	const body = translationExpr.get('body')
	if (Array.isArray(body)) {
		throw new Error('Unexpected array')
	}
	if (body.isBlockStatement()) {
		const innerBody = (body as NodePath<t.BlockStatement>).get('body')
		const returnStatements: NodePath<t.ReturnStatement>[] = innerBody
			.map((p): null | NodePath<t.ReturnStatement> => {
				if (p.isReturnStatement()) return p
				return null
			})
			.filter(
				(_: null | NodePath<t.ReturnStatement>): _ is NodePath<t.ReturnStatement> => _ !== null,
			)

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
