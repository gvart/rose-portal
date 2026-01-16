<template>
  <q-footer v-if="isMobile || isTablet" class="floating-nav">
    <q-tabs
      v-model="activeTab"
      dense
      inline-label
      class="nav-tabs"
      active-color="primary"
      indicator-color="transparent"
    >
      <q-route-tab
        v-for="item in navItems"
        :key="item.id"
        :to="item.route"
        :name="item.route"
        :icon="item.icon"
        :label="item.label"
        exact
        class="nav-tab"
      />
    </q-tabs>
  </q-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

const route = useRoute()
const { isMobile, isTablet } = useDeviceDetection()

const navItems = [
  {
    id: 'home',
    label: 'Home',
    route: '/',
    icon: 'home'
  },
  {
    id: 'recipe',
    label: 'Recipe',
    route: '/recipe',
    icon: 'restaurant'
  },
  {
    id: 'plants',
    label: 'Plants',
    route: '/plant-monitor',
    icon: 'spa'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    route: '/calendar',
    icon: 'event'
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: 'settings'
  }
]

// Compute active tab based on current route
const activeTab = computed(() => {
  const current = navItems.find(item => {
    if (item.route === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(item.route)
  })
  return current?.route || '/'
})
</script>

<style scoped>
.floating-nav {
  background: var(--color-bg-primary);
  border-top: 1px solid var(--color-border-primary);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-tabs {
  background: transparent;
  min-height: 56px;
}

.nav-tab {
  min-height: 56px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.025em;
}
</style>
