import { t } from '../src/runtime'

const toUpper = (a: string) => a.toUpperCase()

export default {
	a: {
		b: {
			hello: t((a: { name: string }) => ({
				fi: 'Hei ' + a.name,
				en: 'Hello ' + toUpper(a.name),
			})),
		},
	},
}
