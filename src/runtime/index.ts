export type Translation = string
export type TranslationObject = {
	en: string
	fi: string
	ru?: string
}
export interface T {
	<Arg extends Record<string, any>>(fn: (arg: Arg) => TranslationObject): (arg: Arg) => Translation
	(defs: TranslationObject): () => Translation
}

const t: T = (_ => _) as any
const c: any = (_ => _) as any

const setLanguage: any = () => 42

export { t, c, setLanguage }
