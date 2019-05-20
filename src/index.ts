import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import VirtualStats from './VirtualStats.js'
import { Compiler } from 'webpack'

const pluginName = 'TranslationPlugin'

export type PluginOptions = {
	languages: readonly string[]
}

class TranslationPlugin {
	constructor(private options: PluginOptions) {}

	apply(compiler: Compiler) {
		const { options } = this
		const { context } = compiler
		const fs = compiler.inputFileSystem
		compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
			console.log('module factory')
			factory.hooks.beforeResolve.tap(pluginName, resolverPlugin)
			factory.hooks.parser
				.for('javascript/auto')
				.tap(pluginName, parserPlugin)
		})

		function parserPlugin(parser: any, options: any) {
			console.log('parser plugin')
			parser.hooks.import.tap(
				pluginName,
				(statement: any, source: any) => {
					const sourcePath = path.join(
						parser.state.current.context,
						source,
					)
					console.log('hook', sourcePath)
					if (!sourcePath.includes('translations.js')) {
						// console.log(sourcePath, statement.__proto__)
					}
				},
			)
		}

		function resolverPlugin(req: any) {
			console.log('resolver plugin', req.request)
			if (!req.request.includes('fi.js')) return
			// console.log(req)
			const modulePath = compiler.context + '/test/fi.js'
			// console.log(modulePath)
			const contents = `
        export default function translate(key, arg) {
          const createTranslation = translations.get(key);
          if (createTranslation) return createTranslation(arg);
        }
        const translations = new Map();
        translations.set('test', 'foobar');
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

		function compilePlugin(req: any) {
			console.log('compile plugin', req)
		}
	}
}

export { TranslationPlugin }
