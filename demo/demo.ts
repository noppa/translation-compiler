import translations from './translations'

// HACK: This shouldn't be imported from userland code like this.
// Instead, import from translation-compiler/runtime and then
// in Babel compile step turn this into the gen/ path.
import { setLanguage } from '/translation-compiler/gen/translate'

console.log(setLanguage)

setLanguage('fi', true)

setTimeout(() => {
	console.log(translations.a.b.hello({ name: 'maailma' }))
}, 2000)
