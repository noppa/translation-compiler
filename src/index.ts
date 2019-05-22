import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import VirtualStats from './VirtualStats.js'
import { Compiler } from 'webpack'
import * as _ from 'lodash'

const pluginName = 'TranslationPlugin'

type FilePath = string
type FilePathPredicateFn = (path: FilePath) => boolean
type FilePathPredicate = FilePathPredicateFn | RegExp

export type PluginOptions = {
	languages: readonly string[]
	translationFiles: { [key in FilePath]: FilePathPredicate }
}

type NormalizedPluginOptions = {
	languages: readonly string[]
	translationFiles: { [key in FilePath]: FilePathPredicateFn }
}

function normalizePluginOptions(options: PluginOptions): NormalizedPluginOptions {
	const { languages, translationFiles } = options
	if (_.isEmpty(languages) || !languages.every(_.isString)) {
		const actual = _.truncate(String(languages), { length: 20 })
		throw new Error(`Expected options.languages to be list of strings but it was ${actual}`)
	}
	function raiseInvalidTranslationFilesError(): any {
		const actual = _.truncate(String(translationFiles), { length: 20 })
		throw new Error(
			`Expected options.translationFiles to be map from file path to predicate but it was ${actual}`,
		)
	}
	if (_.isEmpty(translationFiles)) raiseInvalidTranslationFilesError()
	return {
		languages,
		translationFiles: _.mapValues(
			translationFiles,
			(pred: FilePathPredicate): FilePathPredicateFn => {
				if (_.isFunction(pred)) return pred
				if (_.isRegExp(pred)) return (p: FilePath) => pred.test(p)
				return raiseInvalidTranslationFilesError()
			},
		),
	}
}

function isTranslationFile(path: FilePath, options: NormalizedPluginOptions): boolean {
	return Object.values(options.translationFiles).some(fn => fn(path))
}

class TranslationPlugin {
	private options: NormalizedPluginOptions
	constructor(options: PluginOptions) {
		this.options = normalizePluginOptions(options)
	}

	apply(compiler: Compiler) {
		const { options } = this
		const { context } = compiler
		const fs = compiler.inputFileSystem
		compiler.hooks.normalModuleFactory.tap(pluginName, factory => {
			console.log('module factory')
			factory.hooks.beforeResolve.tap(pluginName, resolverPlugin)
			factory.hooks.parser.for('javascript/auto').tap(pluginName, parserPlugin)
		})

		function parserPlugin(parser: any) {
			console.log('parser plugin')
			// TODO: CommonJS requires
			parser.hooks.import.tap(pluginName, (statement: any, source: any) => {
				const sourcePath = path.join(parser.state.current.context, source)
				if (isTranslationFile(sourcePath, options)) {
					console.log('is translation file')
				}
			})
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
