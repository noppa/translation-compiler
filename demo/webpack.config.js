/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const TranslationPlugin = require('../dist/index.js')
const relative = (...p) => path.join(__dirname, ...p)

module.exports = {
	mode: 'development',
	entry: {
		demo: relative('demo.ts'),
	},
	target: 'web',
	devtool: 'source-map',
	output: {
		path: relative('dist'),
		filename: '[name].js',
	},
	plugins: [
		// new TranslationPlugin({
		// 	languages: ['en'],
		// }),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
				exclude: /[/\\]node_modules[/\\]/,
			},
		],
	},
}
