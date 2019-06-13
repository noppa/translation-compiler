import * as t from '@babel/types'

export default function propertyPathToIdentifier(props: string[], lang: string): t.Identifier {
	// TODO: Safer property path
	return t.identifier([lang, ...props].reverse().join('_'))
}
