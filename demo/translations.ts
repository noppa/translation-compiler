import { t } from '../src/runtime'

export default {
	foo: t((a: { x: number }) => {
		return {
			fi: 'Foo fi' + a.x,
			en: 'Foo en',
		}
	}),
}
