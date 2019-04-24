// @flow

export opaque type Translation: string = string
export type TranslationObject = {|
  +en: string,
  +fi: string,
  +ru?: string,
|}
export interface T {
  <+Arg: {[string]: any}>(fn: (arg: Arg) => TranslationObject): (Arg => Translation);
  (defs: TranslationObject): (() => Translation);
}
const t: T = (undefined: any)

export {t}
