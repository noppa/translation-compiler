import * as t from '@babel/types'

export type VisitorStateBase = {
	filename: string
	opts: Options
	cwd: any
}
export type Options = {
	translationFiles: RegExp[]
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

export type TranslationFileCheckParams = Pick<VisitorState, 'filename' | 'opts'>

export function isTranslationFile(state: TranslationFileCheckParams): boolean {
	// TODO: More flexible way to define translation files.
	return state.opts.translationFiles.some(_ => _.test(state.filename))
}
