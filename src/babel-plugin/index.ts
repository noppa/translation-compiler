import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import * as Babel from '@babel/core'
import UnexpectedAstNodeException from './exception/unexpectedAstNode'
import propertyPathToIdentifier from '../core/property-path-to-identifier'

type VisitorState = {
	filename: string
}

export default function(): Babel.PluginObj<VisitorState> {
	return {
		name: 'translation-compiler',
		visitor: {
			ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>, state: VisitorState) {
				const declaration = path.get('declaration')

				if (!t.isObjectExpression(declaration.node)) {
					throw path.buildCodeFrameError(
						'Translation file must have a default expression that is an object containing' +
							'the translation keys.',
					)
				}
				const properties = declaration.get('properties') as NodePath[]
				visitObjectDeclarationProperties(properties, [])
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
			prop.buildCodeFrameError(
				'Translation object keys can only be translation definitions, declared with t(...),' +
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
	if (objectPropertyValue.isCallExpression()) {
		const exportableId = propertyPathToIdentifier(path)
		console.log(exportableId)
	}
}
