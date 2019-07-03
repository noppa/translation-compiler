import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import VirtualStats from './VirtualStats.js'
import { Compiler } from 'webpack'
import * as _ from 'lodash'
import { Options } from '../core/visitor-utils'

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
			// factory.hooks.parser.for('javascript/auto').tap(pluginName, parserPlugin)
		})
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

		function resolverPlugin(req: any) {
			if (!req.request.includes('fi.js') || req.context.includes('node_modules')) return
			const modulePath = compiler.context + '/demo/fi.js'
			console.log(modulePath)
			const contents = `
				import {
					bar
				} from './translations'

				const fi$bar = bar

				export {
					fi$bar as bar
				}
			`

			// Hack to allow access to fs private apis
			const _fs: any = fs
			_fs._readFileStorage.data.set(modulePath, [null, contents])
			_fs._statStorage.data.set(modulePath, [
				null,
				new VirtualStats({
					dev: 8675309,
					nlink: 1,
					uid: 501,
					gid: 20,
					rdev: 0,
					blksize: 4096,
					ino: 44700000,
					mode: 33188,
					size: 1,
					atime: 1,
					mtime: 1,
					ctime: 1,
					birthtime: 1,
				}),
			])
		}
	}
}

export { TranslationPlugin }
