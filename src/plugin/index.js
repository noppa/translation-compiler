const VirtualStats = require('./VirtualStats.js')
const pluginName = 'TranslationPlugin'

module.exports = class TranslationPlugin {
  apply(compiler) {
    const fs = compiler.inputFileSystem
    compiler.hooks.normalModuleFactory.tap(pluginName, nmf => {
      nmf.hooks.beforeResolve.tap(pluginName, resolverPlugin)
    })

    function resolverPlugin(req) {
      if (!req.request.includes('fi.js')) return
      console.log(req)
      const modulePath = compiler.context + '/test/fi.js'
      console.log(modulePath)
      const contents = `
        export default function translate(key, arg) {
          const createTranslation = translations.get(key);
          if (createTranslation) return createTranslation(arg);
        }

        const translations = new Map();
        translations.set('test', 'foobar');
      `
      fs._readFileStorage.data.set(modulePath, [null, contents])
      fs._statStorage.data.set(modulePath, [null, new VirtualStats({
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
      })])
    }
  }
}

