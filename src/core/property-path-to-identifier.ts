import * as t from '@babel/types'

export default function propertyPathToIdentifier(props: string[], lang?: string): t.Identifier {
	const parts = props.slice()
	if (lang) parts.push(lang)
	return t.identifier(parts.join('_'))
}
