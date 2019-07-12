import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import { Compiler } from 'webpack'
import * as _ from 'lodash'
import { Options } from '../core/visitor-utils'
import { translateRuntimePath } from '../core/constants.js'
import * as file from './file'

const pluginName = 'TranslationPlugin'

type FilePath = string

function isTranslationFile(path: FilePath, options: Options): boolean {
	return Object.values(options.translationFiles).some(regex => regex.test(path))
}

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
		compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
			factory.hooks.beforeResolve.tap(pluginName, resolverPlugin)
		})

		function resolverPlugin(req: any) {
			console.log(
				'req',
				req.request,
				req.request === translateRuntimePath,
				req.context.includes('node_modules'),
			)
			const isImportTranslationFile = req.request === translateRuntimePath
			if (!isImportTranslationFile || req.context.includes('node_modules')) return

			const importedIds: string[] = req.dependencies.map(_ => _.id).filter(Boolean)
			file.setFileIfNotExists(fs, translateRuntimePath, getTranslationRuntimeFileContents)

			for (const lang of options.languages) {
				const importStatements = importedIds
					// TODO: Better way to resolve translation file path (config changes or via Babel).
					.map(id => `export {${id}_${lang}} from './translations';`)
					.join('\n')
				// TODO: This should be done at the end of compilation to avoid duplicates
				file.appendToFile(fs, langPath(lang), importStatements)
			}

			// compiler.hooks.compilation.tap(pluginName, function(factory: any) {
			// 	// factory.hooks.dependencyReference.tap(pluginName, (ref: any, oth: any) => {
			// 	// 	if (isTranslationFile(ref.module.resource, options)) {
			// 	// 		console.log(ref.importedNames, Object.keys(ref.module))
			// 	// 	}
			// 	// })
			// 	factory.hooks.optimizeDependenciesAdvanced.tap(pluginName, (...args) => {
			// 		console.log('opt', args)
			// 	})

			// 	// factory.hooks.parser.for('javascript/auto').tap(pluginName, function(parser: any) {
			// 	// 	console.log('parser')
			// 	// 	parser.hooks.evaluate.for('CallExpression').tap(pluginName, function(...args) {
			// 	// 		console.log('expr', args, this)
			// 	// 	})
			// 	// })
			// })

			function parserPlugin(parser: any) {
				console.log('parser plugin')
				// TODO: CommonJS requires
				parser.hooks.import.tap(pluginName, (statement: any, source: any) => {
					const sourcePath = path.join(parser.state.current.context, source)
					if (isTranslationFile(sourcePath, options)) {
						console.log('is translation file', sourcePath, statement)
					}
				})
				parser.hooks.evaluate
					.for('CallExpression')
					.tap(pluginName, (objectExpression: string, args: any, b: any) => {
						console.log('call', objectExpression, args, b)
					})
			}

			function getTranslationRuntimeFileContents() {
				// TODO: Better impl
				return options.languages
					.map(lang => `const ${lang} = () => import('${langPath(lang)}')`)
					.join('\n')
			}
		}
	}
}

const langPath = (lang: string) => `translation-compiler/gen/langs/${lang}.js`

export { TranslationPlugin }
