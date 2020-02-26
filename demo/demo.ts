import translations, { setLanguage } from './translations'

console.log(setLanguage)

setLanguage('fi', true)

setTimeout(() => {
	console.log(translations.a.b.hello({ name: 'maailma' }))
}, 2000)
