import * as t from '@babel/types'
import * as Babel from '@babel/core'
import { NodePath } from '@babel/traverse'
import UnexpectedAstNodeException from './exception/unexpectedAstNode'

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
				visitObjectDeclarationProperties(properties)
				// Babel.traverse(properties)
			},
		},
	}
}

function visitObjectDeclarationProperties(properties: NodePath[]) {
	for (const prop of properties) {
		if (t.isObjectProperty(prop)) {
			visitTranslationObject(prop.get('value'))
		} else {
			prop.buildCodeFrameError(
				'Translation object keys can only be translation definitions, declared with t(...),' +
					' or nested objects containing the translation objects.',
			)
		}
	}
}

function visitTranslationObject(objectPropertyValue) {
	if (t.isObjectExpression(objectPropertyValue.node)) {
		const properties = objectPropertyValue.get('properties') as NodePath[]
		return visitObjectDeclarationProperties(properties)
	}
}
