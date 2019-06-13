import { t } from '../src/runtime'

const toUpper = (a: string) => a.toUpperCase()

const upperEn = toUpper('usssss123')

export default {
	a: {
		b: {
			foo: t((a: { x: number }) => ({
				fi: 'Foo fi' + a.x,
				en: 'Foo en ' + upperEn,
			})),
		},
	},
}
