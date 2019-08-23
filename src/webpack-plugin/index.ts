import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import { Compiler } from 'webpack'
import * as _ from 'lodash'
import { Options } from '../core/visitor-utils'
import { translateRuntimePath } from '../core/constants.js'
import * as file from './file'

const pluginName = 'TranslationPlugin'

class TranslationPlugin {
	private options: Options
	constructor(options: Options) {
		if (!Array.isArray(options.translationFiles)) {
			throw new Error('Invalid options to plugin')
		}
		this.options = options
	}

	apply(compiler: Compiler) {
		const { options } = this
		const { context } = compiler
		const fs = compiler.inputFileSystem
		file.setFileIfNotExists(fs, translateRuntimePath, getTranslationRuntimeFileContents)

		function getTranslationRuntimeFileContents() {
			// TODO: Better impl
			return options.languages
				.map(lang => `const ${lang} = () => import('${langPath(lang)}')`)
				.join('\n')
		}
		compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
			factory.hooks.beforeResolve.tap(pluginName, resolverPlugin)
		})

		function resolverPlugin(req: any) {
			const isImportTranslationFile = req.request === translateRuntimePath

			if (!isImportTranslationFile || req.context.includes('node_modules')) return
			file.setFileIfNotExists(fs, translateRuntimePath, getTranslationRuntimeFileContents)

			const importedIds: string[] = req.dependencies.map(_ => _.id).filter(Boolean)

			// TODO: Better way to resolve translation file path (config changes or via Babel).
			const translationFilePath = path.join(context, options.translationFiles[0])

			for (const lang of options.languages) {
				const importStatements = importedIds
					.map(id => `export {${id}_${lang}} from '${translationFilePath}';`)
					.join('\n')
				// TODO: This should be done at the end of compilation to avoid duplicates
				file.appendToFile(fs, langPath(lang), importStatements)
			}
		}
	}
}

const langPath = (lang: string) => `/translation-compiler/gen/langs/${lang}.js`

export { TranslationPlugin }
