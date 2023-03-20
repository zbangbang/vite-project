import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import { router } from '@/router/index'
// 自定义指令
import directives from '@/directives/index'
import 'normalize.css'
import './styles/index.scss'
import 'animate.css'
import { gsap } from 'gsap'

import * as lodash from 'lodash'
// 扩展提示
import '@/types/index'
// 创建实例
import App from './App.vue'

const app = createApp(App)
// 导入element icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 插件
app.use(ElementPlus).use(createPinia()).use(router).use(directives)
// 全局变量
app.config.globalProperties.$gsap = gsap
app.config.globalProperties.$lodash = lodash

app.mount('#app')
