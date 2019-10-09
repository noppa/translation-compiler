import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import { Compiler } from 'webpack'
import * as _ from 'lodash'
import { Options, str } from '../core/visitor-utils'
import { translateRuntimePath } from '../core/constants.js'
import * as file from './file'
import UniqueIndexGenerator from './UniqueIndexGenerator'

const pluginName = 'TranslationPlugin'

class TranslationPlugin {
	private options: Options
	private indexGenerator: UniqueIndexGenerator

	constructor(options: Options) {
		if (!Array.isArray(options.translationFiles)) {
			throw new Error('Invalid options to plugin')
		}
		this.options = options
		this.indexGenerator = new UniqueIndexGenerator()
	}

	apply(compiler: Compiler) {
		const { options } = this
		const { context } = compiler
		const fs = compiler.inputFileSystem
		file.setFileIfNotExists(fs, translateRuntimePath, getTranslationRuntimeFileContents)

		function getTranslationRuntimeFileContents() {
			const declarations = `
				const selectedLanguageIndex = 0;
				const languageCache = new Map();
				const defaultTranslationForMissingKey = '[Missing translation]'
			`
			const langLoaders = options.languages.map(
				(lang, i) => `
					  ${lang}: () => {
							import('${langPath(lang)}').then(translationModule => {
								languageCache.set(${i}, translationModule.t);
							});
						}
				`,
			)

			return [
				declarations,
				'const _translation_compiler_load_language = {',
				langLoaders.join(',\n'),
				'};',
				// DEBUG
				'_translation_compiler_load_language.fi();',
			].join('\n')
		}

		compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
			factory.hooks.beforeResolve.tap(pluginName, resolverPlugin)
		})

		const resolverPlugin = (req: any) => {
			const isImportTranslationFile = req.request === translateRuntimePath

			if (!isImportTranslationFile || req.context.includes('node_modules')) return
			file.setFileIfNotExists(fs, translateRuntimePath, getTranslationRuntimeFileContents)

			const importedIds: string[] = req.dependencies.map(_ => _.id).filter(Boolean)

			// TODO: Better way to resolve translation file path (config changes or via Babel).
			const translationFilePath = path.join(context, options.translationFiles[0])

			const { languages } = options
			for (let languageIndex = 0, n = languages.length; languageIndex < n; languageIndex++) {
				const lang = languages[languageIndex]
				const importsFromLanguagefile: string[] = []

				for (const importedIdentifier of importedIds) {
					const generatedIndex = this.indexGenerator.uniqueIndexForName(importedIdentifier)
					const translationIdentifier = `${importedIdentifier}_${lang}`

					const importFromLanguagefile = `
						import {${translationIdentifier}} from '${translationFilePath}';
						t.set(${generatedIndex}, ${translationIdentifier});
					`
					importsFromLanguagefile.push(importFromLanguagefile)
				}
				// TODO: This should be done at the end of compilation to avoid duplicates
				const importsTemplate = [
					'export const t = new Map();',
					importsFromLanguagefile.join('\n\n'),
				].join('\n')
				file.appendToFile(fs, langPath(lang), importsTemplate)
			}

			const translatorsForRuntime: string[] = []
			for (const importedIdentifier of importedIds) {
				const generatedIndex = this.indexGenerator.uniqueIndexForName(importedIdentifier)
				const translatorForRuntime = `
						export const ${importedIdentifier} = _ => {
							const language = languageCache.get(selectedLanguageIndex);
							if (language) {
								const translate = language.get(${generatedIndex});
								if (translate) {
									try {
										return translate(_);
									} catch(err) {
										// DEBUG
										console.error('fail', err)
									}
								}
							}
							return defaultTranslationForMissingKey
						}
					`
				translatorsForRuntime.push(translatorForRuntime)
				file.appendToFile(fs, translateRuntimePath, translatorsForRuntime.join('\n\n'))
			}
		}
	}
}

const langPath = (lang: string) => `/translation-compiler/gen/langs/${lang}.js`

export { TranslationPlugin }
