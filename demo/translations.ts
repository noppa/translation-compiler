import { t, setLanguage } from '../src/runtime'

const toUpper = (a: string) => a.toUpperCase()

export { setLanguage }

export default {
	a: {
		b: {
			hello: t((a: { name: string }) => ({
				fi: 'Hei ' + a.name,
				en: 'Hello ' + toUpper(a.name),
			})),
			bye: t(() => ({
				fi: 'Heippa',
				en: 'Bye',
			})),
		},
		blaa: t({
			fi: 'haa',
			en: 'blaa',
		}),
	},
}
