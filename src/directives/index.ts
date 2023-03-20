import { App } from 'vue'
import draggable from './modules/drag'

const directiveList: { [prop: string]: any } = {
  draggable
}

const directives = {
  install: (app: App<Element>) => {
    Object.keys(directiveList).forEach(key => {
      app.directive(key, directiveList[key])
    })
  }
}

export default directives
