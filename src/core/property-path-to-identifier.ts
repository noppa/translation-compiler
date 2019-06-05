import * as t from '@babel/types'

export default function propertyPathToIdentifier(props: string[]): t.Identifier {
	// TODO: Safer property path
	return t.identifier(props.join('$'))
}
