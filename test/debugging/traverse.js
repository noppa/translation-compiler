/* eslint-disable @typescript-eslint/no-var-requires */

// This file is for quick & dirty
// interactive development of the plugin.

const babelParser = require('@babel/parser')
const babelTraverse = require('@babel/traverse')
const fs = require('fs')
const path = require('path')

const testFilename = 'demo.ts'
const fileToTest = path.join(__dirname, '../../demo/' + testFilename)
const code = fs.readFileSync(fileToTest, 'utf8')
const ast = babelParser.parse(code, {
	sourceType: 'module',
	plugins: ['typescript'],
})

const traverser = require('../../dist/babel-plugin/index.js').default().visitor

const pluginOptions = require('../../demo/babel.config.js').plugins[0][1]

babelTraverse.default(ast, traverser, undefined, {
	filename: testFilename,
	opts: pluginOptions,
})
