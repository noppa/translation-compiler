import { t, c } from '../src/runtime'

export const foo = (a: { foo: number }) => {
	return {
		fi: 'Foo fi ' + a.foo,
		en: 'Foo en',
	}
}

const momentValue = /*#__PURE__*/ c()

export const bar = {
	deep: {
		prop: {
			fi: 'Bar fi' + momentValue,
			en: 'Bar en',
		},
	},
}
