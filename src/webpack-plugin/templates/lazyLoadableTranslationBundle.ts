export function importsFromLanguageFileTemplate(
	translationConfigs: { identifier: string; index: number }[],
	translationFilePath: string,
	language: string,
) {
	const imports =
		'import {' +
		translationConfigs.map(_ => _.identifier).join(',') +
		'} from ' +
		JSON.stringify(translationFilePath)

	const translations =
		'{\n' + translationConfigs.map(_ => `'${_.index}': ${_.identifier}`).join(',\n') + '\n};'

	return `
		${imports}
		const _translation_compiler_all_translations_collection = ${translations};
		export {_translation_compiler_all_translations_collection as t};
	`
}
