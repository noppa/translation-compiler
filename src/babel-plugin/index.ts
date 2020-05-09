import * as Babel from '@babel/core'
import annotateAsPure from '@babel/helper-annotate-as-pure'
import { VisitorState, isTranslationFile } from '../core/visitor-utils'
import { ImportDeclaration } from './translation-consumer-visitor'
import { ExportDefaultDeclaration } from './translation-provider-visitor'

export default function (): Babel.PluginObj<VisitorState> {
	return {
		name: 'translation-compiler',
		visitor: {
			CallExpression(path, state) {
				if (isTranslationFile(state)) annotateAsPure(path)
			},
			ExportDefaultDeclaration,
			ImportDeclaration,
		},
	}
}
