/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const translationCompiler = path.resolve(__dirname, '../dist/babel-plugin/index.js')

module.exports = {
	presets: ['@babel/preset-typescript'],
	plugins: [
		[
			translationCompiler,
			{
				translationFiles: ['./demo/translations'],
				languages: ['fi'],
			},
		],
	],
}
