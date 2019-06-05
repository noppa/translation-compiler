import * as Babel from '@babel/core'
import * as t from '@babel/types'
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

				console.log(declaration, 'good')
			},
		},
	}
}
