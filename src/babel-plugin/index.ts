import * as Babel from '@babel/core'
import * as t from 'babel-types'
import { NodePath } from '@babel/traverse'

type VisitorState = {
	filename: string
}

export default function(options: any): Babel.PluginObj<VisitorState> {
	console.log('babel plugin')
	return {
		name: 'translation-compiler',
		visitor: {
			ExportDefaultDeclaration(path: NodePath, state: VisitorState) {
				console.log('hello')
			},
		},
	}
}
