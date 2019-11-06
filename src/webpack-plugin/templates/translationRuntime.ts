import { langPath } from '../helpers'

export function topLevelDeclarationsTemplate(languageLoaders: string[]) {
	return `
var _selectedlanguageIndex = 0;
var _defaultTranslationForMissingKey = '[Missing translation]';

var _languageLoaders = [
${languageLoaders.join(',\n')}
];

export function setLanguage(languageName) {
	var i = 0, n = _languageLoaders.length, loader;
	while(i < n) {
		loader = _languageLoaders[i];
		if (loader.n === languageName) {
			_selectedLanguageIndex = i;
			return;
		}
		i++;
	}
	throw new Error('Language "' + languageName + '" not found!');
}

	`
}

export function languageLoaderTemplate(languageName: string, languageIndex: number) {
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
			_selectedlanguageIndex = ${languageIndex};
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
			s: getStatus,
			n: '${languageName}'
		}
	})()
	`
}

export function languageTranslatorTemplate(
	translationIdentifier: string,
	translationIndex: number,
) {
	return `
		function ${translationIdentifier}(params) {
			var language = _languageLoaders[_selectedlanguageIndex];
			if (language) {
				var translate = language.t(${translationIndex});
				if (translate) {
					return translate(params);
				}
			}
			return _defaultTranslationForMissingKey
		}
	`
}
