import {
  createRouter,
  createWebHashHistory,
  Router,
  RouteRecordRaw
} from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/index.vue')
  },
  {
    path: '/ts',
    children: [
      {
        path: 'type',
        children: [
          {
            path: 'extends',
            component: () => import('@/views/ts/type/index.vue')
          },
          {
            path: 'infer',
            component: () => import('@/views/ts/infer/index.vue')
          }
        ]
      },
      {
        path: 'props',
        children: [
          {
            path: 'provide',
            component: () => import('@/views/props/index.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/vue3',
    children: [
      {
        path: 'transition',
        children: [
          {
            path: 'animation',
            component: () => import('@/views/transition/animation.vue')
          },
          {
            path: 'fade',
            component: () => import('@/views/transition/transitionEvent.vue')
          },
          {
            path: 'group',
            component: () => import('@/views/transition/group.vue')
          },
          {
            path: 'state',
            component: () => import('@/views/transition/state.vue')
          },
          // {
          //   path: 'provide',
          //   component: () => import('@/views/provide/index.vue')
          // }
        ]
      },
      {
        path: 'props',
        children: [
          {
            path: 'provide',
            component: () => import('@/views/props/index.vue')
          }
        ]
      },
      {
        path: 'directive',
        children: [
          {
            path: 'drag',
            component: () => import('@/views/directive/index.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/echarts',
    children: [
      {
        path: 'pie-chart',
        children: [
          {
            path: 'chart1',
            component: () => import('@/views/echarts/index.vue')
          }
        ]
      },
      {
        path: 'props',
        children: [
          {
            path: 'provide',
            component: () => import('@/views/props/index.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/cesium',
    children: [
      {
        path: 'weather',
        children: [
          {
            path: 'fog',
            component: () => import('@/views/cesium/weather/fog.vue')
          },
          {
            path: 'rain',
            component: () => import('@/views/cesium/weather/rain.vue')
          },
          {
            path: 'snow',
            component: () => import('@/views/cesium/weather/snow.vue')
          },
          {
            path: 'command',
            component: () => import('@/views/cesium/command/index.vue')
          }
        ]
      },
      {
        path: 'command',
        component: () => import('@/views/cesium/command/index.vue')
      },
      {
        path: 'demo',
        component: () => import('@/views/cesium/demo/index.vue')
      },
      {
        path: 'cesium-s',
        component: () => import('@/views/cesium/cesium-s/index.vue')
      }
    ]
  },
  {
    path: '/konva',
    children: [
      {
        path: 'wcs',
        children: [
          {
            path: 'group',
            component: () => import('@/views/konva/wcs/group.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/webgl',
    children: [
      {
        path: 'p1',
        children: [
          {
            path: 'l1',
            component: () => import('@/views/webgl/lesson1/index.vue')
          },
          {
            path: 'l2',
            component: () => import('@/views/webgl/lesson2/index.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/openlayers',
    children: [
      {
        path: 'p1',
        children: [
          {
            path: 'line',
            component: () => import('@/views/openlayers/p1/line.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/fabric',
    children: [
      {
        path: 'index',
        component: () => import('@/views/fabric/index.vue')
      }
    ]
  },
  {
    path: '/mapbox',
    children: [
      {
        path: 'customLayer',
        component: () => import('@/views/mapbox/custom/customLayer.vue')
      },
      {
        path: 'marker',
        component: () => import('@/views/mapbox/marker/index.vue')
      },
      {
        path: 'layer',
        component: () => import('@/views/mapbox/layer/index.vue')
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})
