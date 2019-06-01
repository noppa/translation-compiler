import { t, c } from '../src/runtime'
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
const t = /*#__PURE__*/ c(moment, 'format')

export function bar(a) {
	return 'Foo fi' + a.x
}
