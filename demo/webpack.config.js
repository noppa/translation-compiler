/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
// const TerserPlugin = require('terser-webpack-plugin')
// const { TranslationPlugin } = require('../dist/index.js')
const relative = (...p) => path.join(__dirname, ...p)
const babelConfig = require('./babel.config.js')

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
		// TODO: Better resolve for translation options
		new TranslationPlugin(babelConfig.plugins[0][1]),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							...babelConfig,
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
