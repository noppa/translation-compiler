import { t } from '../src/runtime'

export default {
	a: {
		b: {
			foo: t((a: { x: number }) => ({
				fi: 'Foo fi' + a.x,
				en: 'Foo en',
			})),
		},
	},
}
