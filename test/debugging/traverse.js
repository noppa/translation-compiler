/* eslint-disable @typescript-eslint/no-var-requires */

// This file is for quick & dirty
// interactive development of the plugin.

const babelParser = require('@babel/parser')
const babelTraverse = require('@babel/traverse')
const fs = require('fs')
const path = require('path')

const fileToTest = path.join(__dirname, '../../demo/translations.ts')
const code = fs.readFileSync(fileToTest, 'utf8')
const ast = babelParser.parse(code, {
	sourceType: 'module',
	plugins: ['typescript'],
})

const traverser = require('../../dist/babel-plugin/index.js').default().visitor

babelTraverse.default(ast, traverser)
