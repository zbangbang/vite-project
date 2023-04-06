import { gsap } from 'gsap'
import * as lodash from 'lodash'
import * as Cesium from 'cesium'

export { }

declare module 'vue' {
  interface ComponentCustomProperties {
    $gsap: typeof gsap
    $lodash: typeof lodash
    $Viewer: Cesium.Viewer | null
  }
}
