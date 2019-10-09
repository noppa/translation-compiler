import translations from './translations'

setTimeout(() => {
	console.log(translations.a.b.hello({ name: 'maailma' }))
}, 2000)
