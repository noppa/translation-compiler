import * as Babel from '@babel/core'
import * as t from 'babel-types'

type VisitorState = {}

export default function(options: any): Babel.PluginObj<VisitorState> {
	console.log('babel plugin')
	return {
		visitor: {
			ExportDefaultDeclaration(path, state) {
				console.log('export default', path, state)
			},
		},
	}
}
