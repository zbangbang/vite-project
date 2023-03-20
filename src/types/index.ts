import { gsap } from 'gsap'
import * as lodash from 'lodash'

export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $gsap: typeof gsap
    $lodash: typeof lodash
  }
}
