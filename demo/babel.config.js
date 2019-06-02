/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
	presets: ['@babel/preset-typescript'],
	plugins: [path.resolve(__dirname, '../dist/babel-plugin/index.js')],
}
