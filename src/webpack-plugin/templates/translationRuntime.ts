import { langPath } from '../helpers'

export function translationRuntimeTemplate(languageLoaders: string[]) {
	return `
var _selectedlanguageIndex = 0;
var _defaultTranslationForMissingKey = '[Missing translation]';

var _languageLoaders = [
${languageLoaders.join(',\n')}
];

function findLanguageIndexOrError(languageName) {
	var i = 0, n = _languageLoaders.length, loader;
	while(i < n) {
		loader = _languageLoaders[i];
		if (loader.n === languageName) {
			return i;
		}
		i++;
	}
	throw new Error('Language "' + languageName + '" not found!');
}

function loadLanguageIndex(languageIndex, forceReload) {
	var loader = _languageLoaders[languageIndex];
	if (loader.s > 0 && !forceReload) {
		return Promise.resolve();
	}
	return loader.l();
}

export function loadLanguage(languageName, forceReload) {
	return loadLanguageIndex(findLanguageIndexOrError(languageName), !!forceReload);
}

export function setLanguage(languageName, load) {
	_selectedLanguageIndex = findLanguageIndexOrError(languageName);
	if (load) return loadLanguageIndex(_selectedLanguageIndex, false);
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
