/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
// const TerserPlugin = require('terser-webpack-plugin')
// const { TranslationPlugin } = require('../dist/index.js')
const relative = (...p) => path.join(__dirname, ...p)

module.exports = {
	mode: 'development',
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
						options: {
							...require('./babel.config.js'),
						},
					},
				],
				exclude: /[/\\]node_modules[/\\]/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	// optimization: {
	// 	minimizer: [
	// 		new TerserPlugin({
	// 			// terserOptions: {
	// 			// 	compress: {
	// 			// 		inline: true,
	// 			// 		passes: 3,
	// 			// 		reduce_vars: true,
	// 			// 		reduce_funcs: true,
	// 			// 		pure_getters: true,
	// 			// 		toplevel: true,
	// 			// 		pure_funcs: ['a$b$foo$fi'],
	// 			// 	},
	// 			// },
	// 		}),
	// 	],
	// },
}
