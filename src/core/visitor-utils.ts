import * as t from '@babel/types'
import * as path from 'path'

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
	const { cwd } = state
	const translationFiles = state.opts.translationFiles.map(_ => path.join(cwd, _))
	// Remove extension
	const filename = state.filename.replace(/\.[^/.]+$/, '')
	return translationFiles.includes(filename)
}

export const str = (...stringParts: string[]) => stringParts.join(' ')
