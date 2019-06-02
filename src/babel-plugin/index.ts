import * as Babel from '@babel/core'
import * as t from 'babel-types'
import { NodePath } from '@babel/traverse'

type VisitorState = {
	filename: string
}

export default function(): Babel.PluginObj<VisitorState> {
	return {
		name: 'translation-compiler',
		visitor: {
			ExportDefaultDeclaration(path: NodePath, state: VisitorState) {
				console.log('hello 2')
			},
		},
	}
}

class Foo {}
