import {
  createRouter,
  createWebHashHistory,
  Router,
  RouteRecordRaw
} from 'vue-router'

export const routes: RouteRecordRaw[] = [
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
            component: () => import('@/views/ts/type/extends/index.vue')
          },
          {
            path: 'infer',
            component: () => import('@/views/ts/type/infer/index.vue')
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
            component: () => import('@/views/vue3/transition/animation/index.vue')
          },
          {
            path: 'fade',
            component: () => import('@/views/vue3/transition/fade/index.vue')
          },
          {
            path: 'group',
            component: () => import('@/views/vue3/transition/group/index.vue')
          },
          {
            path: 'state',
            component: () => import('@/views/vue3/transition/state/index.vue')
          }
        ]
      },
      {
        path: 'props',
        children: [
          {
            path: 'provide',
            component: () => import('@/views/vue3/props/provide/index.vue')
          }
        ]
      },
      {
        path: 'directive',
        children: [
          {
            path: 'drag',
            component: () => import('@/views/vue3/directive/drag/index.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/echarts',
    children: [
      {
        path: 'pieChart',
        children: [
          {
            path: 'chart',
            component: () => import('@/views/echarts/pieChart/chart/index.vue')
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
            component: () => import('@/views/cesium/weather/fog/index.vue')
          },
          {
            path: 'rain',
            component: () => import('@/views/cesium/weather/rain/index.vue')
          },
          {
            path: 'snow',
            component: () => import('@/views/cesium/weather/snow/index.vue')
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
            component: () => import('@/views/konva/wcs/group/index.vue')
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
            component: () => import('@/views/webgl/p1/l1/index.vue')
          },
          {
            path: 'l2',
            component: () => import('@/views/webgl/p1/l2/index.vue')
          },
          {
            path: 'l3',
            component: () => import('@/views/webgl/p1/l3/index.vue')
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
            component: () => import('@/views/openlayers/p1/line/index.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/fabric',
    children: [
      {
        path: 'demo',
        component: () => import('@/views/fabric/demo/index.vue')
      }
    ]
  },
  {
    path: '/mapbox',
    children: [
      {
        path: 'custom',
        component: () => import('@/views/mapbox/custom/index.vue')
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
  },
  {
    path: '/maptest',
    children: [
      {
        path: 'initMap',
        component: () => import('@/views/maptest/initMap/index.vue')
      },
      {
        path: 'polarMap',
        component: () => import('@/views/maptest/polarMap/index.vue')
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})
