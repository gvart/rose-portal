<template>
  <nav v-if="isMobile || isTablet" class="floating-nav">
    <div class="nav-container">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-item', { active: isActive(item.route) }]"
        @click="navigate(item.route)"
        v-haptic
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import RecipeIcon from '@/components/icons/RecipeIcon.vue'
import PlantIcon from '@/components/icons/PlantIcon.vue'
import CalendarIcon from '@/components/icons/CalendarIcon.vue'
import SettingsIcon from '@/components/icons/SettingsIcon.vue'

const router = useRouter()
const route = useRoute()
const { isMobile, isTablet } = useDeviceDetection()

const navItems = [
  {
    id: 'home',
    label: 'Home',
    route: '/',
    icon: HomeIcon
  },
  {
    id: 'recipe',
    label: 'Recipe',
    route: '/recipe',
    icon: RecipeIcon
  },
  {
    id: 'plants',
    label: 'Plants',
    route: '/plant-monitor',
    icon: PlantIcon
  },
  {
    id: 'calendar',
    label: 'Calendar',
    route: '/calendar',
    icon: CalendarIcon
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: SettingsIcon
  }
]

const isActive = (itemRoute: string) => {
  if (itemRoute === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(itemRoute)
}

const navigate = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.floating-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
  pointer-events: none;
}

.nav-container {
  margin: 0 12px 12px;
  padding: 8px 16px;
  border-radius: 24px;
  pointer-events: auto;

  /* Enhanced glassmorphism */
  background: var(--glass-bg-primary);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);

  border: var(--glass-border-inner);
  box-shadow:
    var(--glass-shadow-lg),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);

  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 4px;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 12px;

  min-width: 44px;
  min-height: 44px;

  background: transparent;
  border: none;
  color: rgba(60, 60, 67, 0.6);
  transition: all 0.3s var(--spring-ios);
  cursor: pointer;
}

.nav-item.active {
  color: #007AFF; /* iOS blue */
  background: rgba(0, 122, 255, 0.1);
}

.nav-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s var(--spring-bounce);
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: -0.08px;
}
</style>
