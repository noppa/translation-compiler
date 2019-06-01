/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
// const { TranslationPlugin } = require('../dist/index.js')
const relative = (...p) => path.join(__dirname, ...p)

module.exports = {
	mode: 'production',
	entry: {
		demo: relative('index.ts'),
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
		// 	translationFiles: {
		// 		[relative('./compiled-translations')]: /translations(?:\.ts)?$/,
		// 	},
		// }),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'babel-loader',
					},
				],
				exclude: /[/\\]node_modules[/\\]/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
}
