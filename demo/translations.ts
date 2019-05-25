import { t } from '../src/runtime'

export const foo = /*#__PURE__*/ t((a: { foo: number }) => {
	return {
		fi: 'Foo fi ' + a.foo,
		en: 'Foo en',
	}
})

export const bar = {
	deep: {
		prop: {
			fi: 'Bar fi',
			en: 'Bar en',
		},
	},
}
