<template>
  <nav v-if="isMobile || isTablet" class="floating-nav">
    <div class="nav-container">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-item', { active: isActive(item.route) }]"
        @click="navigate(item.route)"
       
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
  margin: 0 var(--space-3) var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  pointer-events: auto;

  /* Borders-only depth with subtle shadow */
  background: var(--color-bg-primary);
  border: var(--depth-4-border);
  box-shadow: var(--depth-4-shadow);

  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: var(--space-1);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border-radius: var(--radius-md);

  min-width: var(--space-11);
  min-height: var(--space-11);

  background: transparent;
  border: none;
  color: var(--color-text-muted);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.nav-item:active {
  transform: scale(0.96);
  background: var(--color-bg-active);
}

.nav-item.active {
  color: var(--color-accent-primary);
  background: var(--color-info-bg);
}

.nav-icon {
  width: 24px;
  height: 24px;
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.nav-item.active .nav-icon {
  transform: scale(1.05);
}

.nav-label {
  font-size: var(--font-size-10);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
}
</style>
