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

				for (const prop of declaration.properties) {
					if (t.isObjectProperty(prop)) {
						visitTranslationObjectProperty(prop)
					} else {
						path.buildCodeFrameError(
							'Translation object keys can only be translation definitions, declared with t(...),' +
								' or nested objects containing the translation objects.',
						)
					}
				}
			},
		},
	}
}

function visitTranslationObjectProperty(node: t.ObjectProperty) {}
