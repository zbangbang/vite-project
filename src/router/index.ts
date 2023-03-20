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
          {
            path: 'provide',
            component: () => import('@/views/provide/index.vue')
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
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})