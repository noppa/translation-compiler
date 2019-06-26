module.exports = {
	presets: [
		'@babel/preset-typescript',
		['@babel/preset-env', {
			targets: {
				node: '8.14',
			},
			loose: true,
			// TODO: Maybe add both commonjs & ES modules to prod build.
			modules: 'commonjs',
		}]
	],
	sourceMaps: true,
}
