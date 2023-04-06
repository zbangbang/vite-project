import { defineStore } from 'pinia'
import { MenuItemType } from '@/types/menu'

const useMenuStore = defineStore('menu', {
  state: () => {
    return {
      menuList: [
        {
          path: '/ts',
          id: '2',
          flag: false,
          name: 'ts',
          type: 'ts',
          icon: 'bicycle',
          children: [
            {
              path: '/ts/type',
              id: '2-1',
              flag: false,
              name: '类型',
              type: 'type',
              icon: 'location',
              children: [
                {
                  path: '/ts/type/infer',
                  id: '2-1-1',
                  flag: false,
                  name: '交叉类型',
                  type: 'infer',
                  icon: 'location',
                  children: []
                }
              ]
            }
          ]
        },
        {
          path: '/vue3',
          id: '1',
          flag: false,
          name: 'Vue3',
          type: 'vue',
          icon: 'van',
          children: [
            {
              path: '/vue3/transition',
              id: '1-1',
              flag: false,
              name: '过渡',
              type: 'transition',
              icon: 'location',
              children: [
                {
                  path: '/vue3/transition/animation',
                  id: '1-1-1',
                  flag: false,
                  name: '使用animation.css',
                  type: 'animation',
                  icon: 'location',
                  children: []
                },
                {
                  path: '/vue3/transition/fade',
                  id: '1-1-2',
                  flag: false,
                  name: '使用过渡事件',
                  type: 'fade',
                  icon: 'location',
                  children: []
                },
                {
                  path: '/vue3/transition/group',
                  id: '1-1-3',
                  flag: false,
                  name: '过渡组',
                  type: 'group',
                  icon: 'location',
                  children: []
                },
                {
                  path: '/vue3/transition/state',
                  id: '1-1-4',
                  flag: false,
                  name: '过渡状态',
                  type: 'state',
                  icon: 'location',
                  children: []
                },
                {
                  path: '/vue3/transition/provide',
                  id: '1-1-5',
                  flag: false,
                  name: 'provide-inject',
                  type: 'provide',
                  icon: 'location',
                  children: []
                }
              ]
            },
            {
              path: '/vue3/props',
              id: '1-2',
              flag: false,
              name: '父子组件',
              type: 'props',
              icon: 'location',
              children: [
                {
                  path: '/vue3/props/provide',
                  id: '1-2-1',
                  flag: false,
                  name: 'provide-inject',
                  type: 'provide',
                  icon: 'location',
                  children: []
                }
              ]
            },
            {
              path: '/vue3/directive',
              id: '1-2',
              flag: false,
              name: '自定义指令',
              type: 'directive',
              icon: 'location',
              children: [
                {
                  path: '/vue3/directive/drag',
                  id: '1-2-1',
                  flag: false,
                  name: '拖拽',
                  type: 'drag',
                  icon: 'location',
                  children: []
                }
              ]
            }
          ]
        }, {
          path: '/echarts',
          id: '3',
          flag: false,
          name: 'echarts',
          type: 'echarts',
          icon: 'bicycle',
          children: [
            {
              path: '/echarts/pie-chart',
              id: '3-1',
              flag: false,
              name: '饼图',
              type: 'pie-chart',
              icon: 'location',
              children: [
                {
                  path: '/echarts/pie-chart/chart1',
                  id: '3-1-1',
                  flag: false,
                  name: 'chart1',
                  type: 'chart1',
                  icon: 'location',
                  children: []
                }
              ]
            }
          ]
        }, {
          path: '/cesium',
          id: '4',
          flag: false,
          name: 'cesium',
          type: 'cesium',
          icon: 'bicycle',
          children: [
            {
              path: '/cesium/weather',
              id: '4-1',
              flag: false,
              name: '天气',
              type: 'weather',
              icon: 'location',
              children: [
                {
                  path: '/cesium/weather/fog',
                  id: '4-1-1',
                  flag: false,
                  name: '雾',
                  type: 'fog',
                  icon: 'location',
                  children: []
                },
                {
                  path: '/cesium/weather/rain',
                  id: '4-1-2',
                  flag: false,
                  name: '雨',
                  type: 'rain',
                  icon: 'location',
                  children: []
                },
                {
                  path: '/cesium/weather/snow',
                  id: '4-1-3',
                  flag: false,
                  name: '雪',
                  type: 'snow',
                  icon: 'location',
                  children: []
                }
              ]
            }
          ]
        },
      ] as MenuItemType[]
    }
  },
  actions: {
    setMenuList() {
      this.menuList = []
    }
  }
})

export default useMenuStore
