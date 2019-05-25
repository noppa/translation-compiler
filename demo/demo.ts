import t from './translate-runtime'

setTimeout(() => {
	console.log(t('foo', { foo: 5 }))
}, 2000)
