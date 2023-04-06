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
    path: '/ts',
    children: [
      {
        path: 'type',
        children: [
          {
            path: 'infer',
            component: () => import('@/views/ts/type/index.vue')
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
          }
        ]
      }
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})
