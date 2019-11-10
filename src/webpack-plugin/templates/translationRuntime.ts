import { langPath } from '../helpers'

export function translationRuntimeTemplate(languageLoaders: string[]) {
	return `
var _selectedLanguageIndex = 0;
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

function mkTranslator(translationIndex) {
	return function translate(params) {
		var language = _languageLoaders[_selectedLanguageIndex];
		if (language) {
			var translator = language.t(translationIndex);
			if (!translator) return _defaultTranslationForMissingKey;
			return translator(params);
		}
		return _defaultTranslationForMissingKey;
	};
}

	`
}

export function languageLoaderTemplate(languageName: string) {
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

		function getTranslator(translationIndex) {
			return cache && cache[translationIndex];
		}

		function getStatus() {
			return pending ? 1 : cache ? 2 : 0
		}

		return {
			l: load,
			t: getTranslator,
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
		var ${translationIdentifier} = mkTranslator(${translationIndex});
	`
}
