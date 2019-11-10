export function importsFromLanguageFileTemplate(
	translationConfigs: { identifier: string; index: number }[],
	translationFilePath: string,
	language: string,
) {
	const imports =
		'import {' +
		translationConfigs.map(_ => _.identifier + '_' + language).join(',') +
		'} from ' +
		JSON.stringify(translationFilePath)
	console.log('debug', imports)

	const translations =
		'{\n' + translationConfigs.map(_ => `'${_.index}': ${_.identifier}`).join(',\n') + '\n};'

	return imports + '\n' + 'export default ' + translations
}
