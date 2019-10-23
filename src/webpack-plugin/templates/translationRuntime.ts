import { langPath } from '../helpers'

export const topLevelDeclarations = `
const selectedLanguageIndex = 0;
const defaultTranslationForMissingKey = '[Missing translation]'
`

export function languageLoader(languageName: string, index: number) {
	return `
	(function(){
		var cache, pending = false;

		function load() {
			pending = true;
			var p = import(
				/* webpackChunkName: 'translations-${languageName}' */'${langPath(languageName)}'
			);
			return p.then(function(translationModule) {
				pending = false;
				cache = translationModule.t;
			});
		}

		function choose() {
			selectedLanguageIndex = ${index};
		}

		function translate(translationIndex, params) {
			var translation = cache && cache[translationIndex];
			if (translation) {
				return translation(params);
			}
		}

		function getStatus() {
			return pending ? 1 : cache ? 2 : 0
		}

		return {
			l: load,
			c: choose,
			t: translate,
			s: getStatus
		}
	})(),
	`
}
