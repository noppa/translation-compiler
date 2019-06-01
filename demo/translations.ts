/*#__PURE__*/
import /*#__PURE__*/ moment from 'moment'

// export default {
// 	foo: t((a: { x: number }) => {
// 		return {
// 			fi: 'Foo fi' + a.x,
// 			en: 'Foo en',
// 		}
// 	}),
// }
const xx = /*#__PURE__*/ c(moment, 'format')

export function bar(a) {
	return 'Foo fi' + a.x
}
