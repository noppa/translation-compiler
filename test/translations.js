// @flow
import {t} from 'translate'

export default {
  hello: t<{name: string}>(({name}) => ({
    en: `Hello ${name}`,
    fi: `Hei ${name}`,
  })),
  foo: t({
    en: 'foo',
    fi: 'foo',
  }),
}
