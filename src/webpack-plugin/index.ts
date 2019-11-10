import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import { Compiler } from 'webpack'
import * as _ from 'lodash'
import { Options, str } from '../core/visitor-utils'
import { translateRuntimePath } from '../core/constants.js'
import * as file from './file'
import UniqueIndexGenerator from './UniqueIndexGenerator'
import {
	languageLoaderTemplate,
	translationRuntimeTemplate,
	languageTranslatorTemplate,
} from './templates/translationRuntime'
import { langPath } from './helpers'
import { importsFromLanguageFileTemplate } from './templates/lazyLoadableTranslationBundle'

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
			const { languages } = options
			const languageLoaders = languages.map((lang, i) => languageLoaderTemplate(lang, i))
			const translationRuntimeCode = translationRuntimeTemplate(languageLoaders)
			return translationRuntimeCode
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
				const importsTemplate = importsFromLanguageFileTemplate(
					importedIds.map(_ => ({
						identifier: _,
						index: this.indexGenerator.uniqueIndexForName(_),
					})),
					translationFilePath,
					lang,
				)

				const lazyLoadableFileExports = importedIds.join(',\n')

				file.appendToFile(fs, langPath(lang), [importsTemplate, lazyLoadableFileExports].join('\n'))
			}

			// TODO: Move to end of compilation to avoid duplicate exports
			const translatorRuntimeExports = importedIds
				.map(
					translationKey =>
						'export ' +
						languageTranslatorTemplate(
							translationKey,
							this.indexGenerator.uniqueIndexForName(translationKey),
						),
				)
				.join('\n')
			file.appendToFile(fs, translateRuntimePath, translatorRuntimeExports)
		}
	}
}

export { TranslationPlugin }
