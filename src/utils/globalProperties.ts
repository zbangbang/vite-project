import { App } from 'vue'
import { gsap } from 'gsap'
import * as lodash from 'lodash'

const globalProperties = {
  install: (app: App<Element>) => {
    app.config.globalProperties.$gsap = gsap
    app.config.globalProperties.$lodash = lodash
    app.config.globalProperties.$Viewer = null
  }
}

export default globalProperties