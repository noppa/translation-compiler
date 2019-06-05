import { t } from '../src/runtime'

const a = {
	foo: t((a: { x: number }) => {
		return {
			fi: 'Foo fi' + a.x,
			en: 'Foo en',
		}
	}),
}

export default a
