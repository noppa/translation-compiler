import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import * as Babel from '@babel/core'
import annotateAsPure from '@babel/helper-annotate-as-pure'
import { resolve as resolvePath, dirname } from 'path'
import propertyPathToIdentifier from '../core/property-path-to-identifier'

type Options = {
	translationFiles: RegExp[]
}

type VisitorStateBase = {
	filename: string
	opts: Options
	cwd: any
}
type TranslationProviderState = VisitorStateBase & {
	declarations: t.ExportNamedDeclaration[]
}
type TranslationConsumerState = VisitorStateBase & {
	imports: {
		name: t.Identifier
		as: t.Identifier
	}[]
}
type VisitorState = TranslationProviderState | TranslationConsumerState

// TODO: Take from config.
const languages = ['fi']

export default function(): Babel.PluginObj<VisitorState> {
	return {
		name: 'translation-compiler',
		visitor: {
			CallExpression(path, state) {
				if (!isTranslationFile(state)) return
				annotateAsPure(path)
			},
			ExportDefaultDeclaration,
			ImportDeclaration,
		},
	}
}

function ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>, state: VisitorState) {
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

const str = (...stringParts: string[]) => stringParts.join(' ')

function ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: VisitorState) {
	if (!isVisitingTranslationConsumer(state)) return
	if (!state.imports) state.imports = []
	// TODO: Better file path resolving? Does Babel have an API for this?
	const importSource = path.node.source.value
	const importedPath = resolvePath(dirname(state.filename), importSource)
	const importingTranslationFile = isTranslationFile({
		filename: importedPath,
		opts: state.opts,
	})
	if (!importingTranslationFile) return

	const specifiers = path.get('specifiers')
	const [defaultSpecifier] = specifiers
	// TODO: Support additional imports?
	if (specifiers.length !== 1 || !defaultSpecifier.isImportDefaultSpecifier()) {
		throw path.buildCodeFrameError('Translation file must be imported using default import')
	}
	for (const val of Object.values(defaultSpecifier.scope.bindings)) {
		const refs = val.referencePaths
		for (const ref of refs) followTranslationsReference(ref, state)
	}

	const importDeclaration = t.importDeclaration(
		state.imports.map(def => t.importSpecifier(def.as, def.name)),
		t.stringLiteral(importSource),
	)
	path.insertBefore(importDeclaration)
	path.stop()
}

function followTranslationsReference(ref: NodePath<t.Node>, state: TranslationConsumerState) {
	const parent = ref.parentPath
	if (parent.isAssignmentExpression() || parent.isVariableDeclarator()) {
		// TODO: Follow the new reference
		console.log(new Error('Not implemented'))
	} else if (parent.isMemberExpression()) {
		let ancestor: NodePath<t.MemberExpression> = parent
		const pathParts: any[] = []
		while (ancestor.parentPath.isMemberExpression()) {
			const parent = ancestor.parentPath
			const property = ancestor.get('property') as NodePath<t.Node>
			// TODO: Get rid of these "any" accessors.
			pathParts.push(property.node['name'])
			ancestor = parent
		}
		// TODO: Make sure we are at a call or spread expression.
		// TODO: Replace the whole member expression tree with direct import.
		const highestAncestor = ancestor.get('property') as NodePath<t.ObjectProperty>
		const statement = highestAncestor.parentPath.parentPath as NodePath<t.Node>

		// TODO: Handle non-function calls
		if (!statement.isCallExpression()) {
			throw statement.buildCodeFrameError('Only function calls are supported at the moment')
		}

		pathParts.push(highestAncestor.node['name'])
		const path = propertyPathToIdentifier(pathParts)
		const pathName = path.name
		const importAs = statement.scope.generateUidIdentifier(pathName)
		state.imports.push({ name: path, as: importAs })
		statement.replaceWith(t.callExpression(importAs, statement.node.arguments))
	} else {
		// TODO: Better error.
		throw parent.buildCodeFrameError(
			str(
				'Translations can only be used directly as function calls,',
				'like `translations.foo.bar()`. Passing around references to translations is not supported.',
			),
		)
	}
}

function isVisitingTranslationProvider(state: VisitorState): state is TranslationProviderState {
	return isTranslationFile(state)
}

function isVisitingTranslationConsumer(state: VisitorState): state is TranslationConsumerState {
	return !isVisitingTranslationProvider(state)
}

type TranslationFileCheckParams = Pick<VisitorState, 'filename' | 'opts'>

function isTranslationFile(state: TranslationFileCheckParams): boolean {
	// TODO: More flexible way to define translation files.
	return state.opts.translationFiles.some(_ => _.test(state.filename))
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

		for (const language of languages) {
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
	const prop = translationExpr.get('properties').find(prop => {
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
	const returnTypeErrorMsg =
		'Translation factory function must return' +
		` a translation object with ${translationObjectShouldBe}.`

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
