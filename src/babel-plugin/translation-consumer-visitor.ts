import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import { resolve as resolvePath, dirname } from 'path'
import propertyPathToIdentifier from '../core/property-path-to-identifier'
import {
	VisitorState,
	TranslationConsumerState,
	isTranslationFile,
	isVisitingTranslationConsumer,
	str,
} from '../core/visitor-utils'
import { translateRuntimePath } from '../core/constants'

export function ImportDeclaration(path: NodePath<t.ImportDeclaration>, state: VisitorState) {
	if (!isVisitingTranslationConsumer(state)) return
	if (!state.imports) state.imports = []

	// TODO: Better file path resolving? Does Babel have an API for this?
	const importSource = path.node.source.value
	const importedPath = resolvePath(dirname(state.filename), importSource)
	const importingTranslationFile = isTranslationFile({
		filename: importedPath,
		opts: state.opts,
		cwd: state.cwd,
	})
	if (!importingTranslationFile) return

	const specifiers = path.get('specifiers')
	const [defaultSpecifier] = specifiers
	// TODO: Support additional imports?
	if (specifiers.length !== 1 || !defaultSpecifier.isImportDefaultSpecifier()) {
		throw path.buildCodeFrameError('Translation file must be imported using default import')
	}
	console.log(defaultSpecifier.scope.bindings)
	for (const val of Object.values(defaultSpecifier.scope.bindings)) {
		const refs = val.referencePaths
		for (const ref of refs) followTranslationsReference(ref, state)
	}

	const importDeclaration = t.importDeclaration(
		state.imports.map(def => t.importSpecifier(def.as, def.name)),
		t.stringLiteral(translateRuntimePath),
	)
	path.replaceWith(importDeclaration)
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
			// TODO(type safety): Get rid of these "any" accessors.
			pathParts.push(property.node['name'])
			ancestor = parent
		}
		// TODO: Make sure we are at a call or spread expression.
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
