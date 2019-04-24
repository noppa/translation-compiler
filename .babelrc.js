module.exports = {
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-flow-strip-types',
    './src/babel-plugin/index.js'
  ]
}