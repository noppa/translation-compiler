import * as t from '@babel/types'
import * as path from 'path'
import process from 'process'

export type VisitorStateBase = {
	filename: string
	opts: Options
	cwd: any
}
export type Options = {
	translationFiles: string[]
	languages: string[]
}

export type TranslationProviderState = VisitorStateBase & {
	declarations: t.ExportNamedDeclaration[]
}
export type TranslationConsumerState = VisitorStateBase & {
	imports: {
		name: t.Identifier
		as: t.Identifier
	}[]
}
export type VisitorState = TranslationProviderState | TranslationConsumerState

export function isVisitingTranslationProvider(
	state: VisitorState,
): state is TranslationProviderState {
	return isTranslationFile(state)
}

export function isVisitingTranslationConsumer(
	state: VisitorState,
): state is TranslationConsumerState {
	return !isVisitingTranslationProvider(state)
}

export type TranslationFileCheckParams = Pick<VisitorState, 'filename' | 'opts' | 'cwd'>

export function isTranslationFile(state: TranslationFileCheckParams): boolean {
	// TODO: More flexible way to define translation files.
	const { cwd: importerDir, filename } = state
	// Remove extension
	const root = process.cwd()
	const fileExtname = path.extname(filename)
	const absPath = path.join(importerDir, filename)

	return state.opts.translationFiles.some((translationFilePattern) => {
		const translationFileExtname = path.extname(translationFilePattern)
		let absTranslationFilePath = path.join(root, translationFilePattern)
		if (!translationFileExtname) {
			// If there's no extension name in the option file pattern, just assume
			// it's the same as the actual file's extension name.
			absTranslationFilePath += fileExtname
		}

		return absPath === absTranslationFilePath
	})
}

export const str = (...stringParts: string[]) => stringParts.join(' ')

export function toArray<T>(val: T[] | null | undefined | T): T[] {
	if (val == null) return []
	return Array.isArray(val) ? val : [val]
}
