import * as t from '@babel/types'
import * as Babel from '@babel/core'
import { NodePath } from '@babel/traverse'
import propertyPathToIdentifier from '../core/property-path-to-identifier'

type VisitorState = {
	filename: string
}

export default function(): Babel.PluginObj<VisitorState> {
	return {
		name: 'translation-compiler',
		visitor: {
			ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
				const declaration = path.get('declaration') as NodePath<t.ObjectExpression>

				if (!t.isObjectExpression(declaration.node)) {
					throw path.buildCodeFrameError(
						'Translation file must have a default export that is an object containing' +
							'the translation keys.',
					)
				}
				const { parentPath } = declaration
				Babel.traverse(declaration.node, translationContainerVisitor, parentPath.scope, parentPath)
			},
		},
	}
}

const translationContainerVisitor = {
	CallExpression(path: NodePath<t.CallExpression>) {
		const callee = path.get('callee')
		if (!callee.isIdentifier()) {
			throw path.buildCodeFrameError('Only direct calls to funcitons are allwed.')
		}

		const parent = path.parent
		if (t.isObjectProperty(parent)) {
			const { key } = parent
			// TODO: Check that the identifier points to imported translate function.
			if (!t.isIdentifier(key)) {
				throw path.buildCodeFrameError('Translation object keys must be normal identifiers.')
			}

			const pathName: string[] = [key.name]
			const program = path.parentPath.findParent(parentPath => {
				if (t.isObjectProperty(parentPath.node) && t.isIdentifier(parentPath.node.key)) {
					pathName.push(parentPath.node.key.name)
					return false
				} else if (path.isProgram()) {
					console.log('woop')
					return true
				} else {
					throw parentPath.buildCodeFrameError(
						'Translation object must be a simple, possibly nested, key-value object.',
					)
				}
			})
			const exportIdentifier = propertyPathToIdentifier(pathName.reverse())
			console.log('expr')
		}
	},
}
