import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import { appRegistry } from '@/config/apps'

const appRoutes = appRegistry
  .filter(app => app.enabled)
  .flatMap(app => {
    const routes = [
      {
        path: app.route,
        name: app.id,
        component: app.component,
        meta: {
          title: app.name,
          color: app.color
        }
      }
    ]

    // Add detail route for plant-monitor
    if (app.id === 'plant-monitor') {
      routes.push({
        path: `${app.route}/:deviceId`,
        name: `${app.id}-detail`,
        component: app.component,
        meta: {
          title: app.name,
          color: app.color
        }
      })
    }

    return routes
  })

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        transition: 'fade'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue'),
      meta: {
        title: 'Settings',
        color: '#6B7280',
        transition: 'slide'
      }
    },
    {
      path: '/install',
      name: 'install',
      component: () => import('@/views/Install.vue'),
      meta: {
        title: 'Install ROSE',
        color: '#10b981',
        transition: 'fade'
      }
    },
    ...appRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Track navigation direction for transitions
let isBack = false

router.beforeEach((to, from) => {
  // Detect if navigation is going back
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length

  // Going back if:
  // 1. Going to home from any page
  // 2. Going to a shallower path (fewer slashes)
  if (to.path === '/' && from.path !== '/') {
    isBack = true
  } else if (toDepth < fromDepth) {
    isBack = true
  } else {
    isBack = false
  }

  // Set transition based on direction
  if (to.path === '/') {
    to.meta.transition = 'fade'
  } else {
    to.meta.transition = isBack ? 'slide-back' : 'slide'
  }
})

export default router
