
declare module 'translate' {
  declare export opaque type Translation: string
  declare export type TranslationObject = {|
    +en: string,
    +fi: string,
    +ru?: string,
  |}
  declare export interface T {
    <+Arg: {[string]: any}>(fn: (arg: Arg) => TranslationObject): (Arg => Translation);
    (defs: TranslationObject): (() => Translation);
  }
  declare export var t: T
}
