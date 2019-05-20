"use strict";
exports.__esModule = true;
var path = require("path");
var VirtualStats_js_1 = require("./VirtualStats.js");
var pluginName = 'TranslationPlugin';
var TranslationPlugin = /** @class */ (function () {
    function TranslationPlugin(options) {
        this.options = options;
    }
    TranslationPlugin.prototype.apply = function (compiler) {
        var options = this.options;
        var context = compiler.context;
        var fs = compiler.inputFileSystem;
        compiler.hooks.normalModuleFactory.tap(pluginName, function (factory) {
            factory.hooks.beforeResolve.tap(pluginName, resolverPlugin);
            factory.hooks.parser["for"]('javascript/auto')
                .tap(pluginName, parserPlugin);
        });
        function parserPlugin(parser, options) {
            parser.hooks["import"].tap(pluginName, function (statement, source) {
                var sourcePath = path.join(parser.state.current.context, source);
                if (!sourcePath.includes('translations.js')) {
                    // console.log(sourcePath, statement.__proto__)
                }
            });
        }
        function resolverPlugin(req) {
            if (!req.request.includes('fi.js'))
                return;
            // console.log(req)
            var modulePath = compiler.context + '/test/fi.js';
            // console.log(modulePath)
            var contents = "\n        export default function translate(key, arg) {\n          const createTranslation = translations.get(key);\n          if (createTranslation) return createTranslation(arg);\n        }\n        const translations = new Map();\n        translations.set('test', 'foobar');\n\t\t\t";
            // Hack to allow access to fs private apis
            var _fs = fs;
            _fs._readFileStorage.data.set(modulePath, [null, contents]);
            _fs._statStorage.data.set(modulePath, [
                null,
                new VirtualStats_js_1["default"]({
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
                    birthtime: 1
                }),
            ]);
        }
        function compilePlugin(req) {
            console.log('compile plugin', req);
        }
    };
    return TranslationPlugin;
}());
exports.TranslationPlugin = TranslationPlugin;
