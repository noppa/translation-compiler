const path = require('path')

const relativeToRoot = p => path.join(__dirname, '..', p) 
const babelrc = require('../.babelrc')
const TranslationPlugin = require('../src/plugin')

module.exports = {
  mode: 'development',
  entry: {
    a: __dirname + '/index.js',
    // b: __dirname + '/index.js',
  },
  target: 'web',
  devtool: 'source-map',
  output: {
    path: relativeToRoot('dist'),
    filename: '[name].js',
  },
  plugins: [
    new TranslationPlugin({
      languages: ['en', 'fi', 'se'],
    }),
  ],
  resolve: {
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              ...babelrc,
              cacheDirectory: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
      // {
      //   test: /translations\.js$/,
      //   use: [
      //     {
      //       loader: relativeToRoot('src/loader/index.js'),
      //     },
      //   ],
      // },
    ],
  },
}
