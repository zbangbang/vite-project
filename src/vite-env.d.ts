/// <reference types="vite/client" />
// vue 组件
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const vueComponent: DefineComponent<{}, {}, any>

  export default vueComponent
}
