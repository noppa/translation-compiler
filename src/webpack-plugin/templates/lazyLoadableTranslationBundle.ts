export function importsFromLanguageFileTemplate(
	translationConfigs: { identifier: string; index: number }[],
	translationFilePath: string,
) {
	const imports =
		'import {' +
		translationConfigs.map(_ => _.identifier).join(',') +
		+'} from ' +
		JSON.stringify(translationFilePath)

	const translations =
		'{\n' + translationConfigs.map(_ => `'${_.index}': ${_.identifier}`).join(',\n') + '\n};'

	return imports + '\n' + translations
}
