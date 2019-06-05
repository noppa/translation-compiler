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
				const { node } = path
				const { declaration } = node

				if (!t.isObjectExpression(declaration)) {
					throw path.buildCodeFrameError(
						'Translation file must have a default expression that is an object containing' +
							'the translation keys.',
					)
				}

				visitObjectDeclarationProperties(declaration, path)
			},
		},
	}
}

function visitObjectDeclarationProperties(
	declaration: t.ObjectExpression,
	path: Babel.NodePath<any>,
) {
	for (const prop of declaration.properties) {
		if (t.isObjectProperty(prop)) {
			// TODO: Giving the original path here will make errors point to the wrong place.
			// Should be path of the property.
			visitTranslationObjectProperty(prop, path)
		} else {
			path.buildCodeFrameError(
				'Translation object keys can only be translation definitions, declared with t(...),' +
					' or nested objects containing the translation objects.',
			)
		}
	}
}

function visitTranslationObjectProperty(node: t.ObjectProperty, path: Babel.NodePath<any>) {
	if (t.isObjectExpression(node)) {
		return visitObjectDeclarationProperties(node, path)
	}
}
