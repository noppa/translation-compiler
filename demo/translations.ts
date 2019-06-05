import { t } from '../src/runtime'

export default {
	a: {
		b: {
			woop: t((a: { x: number }) => {
				return {
					fi: 'Foo fi' + a.x,
					en: 'Foo en',
				}
			}),
		},
	},
}
