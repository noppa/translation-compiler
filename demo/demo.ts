import translations from './translations'
import { setLanguage } from '../src/runtime/index'

console.log(setLanguage)

setLanguage('fi', true)

setTimeout(() => {
	console.log(translations.a.b.hello({ name: 'maailma' }))
}, 2000)
