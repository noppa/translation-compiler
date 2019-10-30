import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import { Compiler } from 'webpack'
import * as _ from 'lodash'
import { Options, str } from '../core/visitor-utils'
import { translateRuntimePath } from '../core/constants.js'
import * as file from './file'
import UniqueIndexGenerator from './UniqueIndexGenerator'
import {
	topLevelDeclarationsTemplate,
	languageLoaderTemplate,
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
			const languageLoaders = options.languages.map(languageLoaderTemplate)
			return [topLevelDeclarationsTemplate(languageLoaders)].join('\n')
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
				)

				file.appendToFile(fs, langPath(lang), importsTemplate)
			}

			const translatorsForRuntime: string[] = importedIds.map(
				_ => 'export ' + languageLoaderTemplate(_, this.indexGenerator.uniqueIndexForName(_)),
			)
			file.appendToFile(fs, translateRuntimePath, translatorsForRuntime.join('\n\n'))
		}
	}
}

export { TranslationPlugin }
