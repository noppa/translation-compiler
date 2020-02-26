module.exports = {
	presets: [
		'@babel/preset-typescript',
		[
			'@babel/preset-env',
			{
				targets: {
					node: '10.19.0',
				},
				loose: true,
				// TODO: Maybe add both commonjs & ES modules to prod build.
				modules: 'commonjs',
			},
		],
	],
	sourceMaps: true,
}
