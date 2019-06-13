import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import * as Babel from '@babel/core'
import propertyPathToIdentifier from '../core/property-path-to-identifier'

type VisitorState = {
	filename: string
}

const declarations: t.ExportNamedDeclaration[] = []

export default function(): Babel.PluginObj<VisitorState> {
	return {
		name: 'translation-compiler',
		visitor: {
			ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
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
		},
	}
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
		const exportableId = propertyPathToIdentifier(path, 'fi')
		const callNode = objectPropertyValue.node
		const translationExpr = callNode.arguments[0]
		if (
			!(
				t.isObjectExpression(translationExpr) ||
				t.isFunctionExpression(translationExpr) ||
				t.isArrowFunctionExpression(translationExpr)
			)
		) {
			throw objectPropertyValue.buildCodeFrameError(
				'Translation factory function t(..) should be called with' +
					' a translation object or a function that returns the object.',
			)
		}
		declarations.push(
			t.exportNamedDeclaration(
				t.variableDeclaration('const', [t.variableDeclarator(exportableId, translationExpr)]),
				[],
			),
		)
	}
}
