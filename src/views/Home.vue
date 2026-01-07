<template>
  <HomeLayout>
    <div class="home-container" :class="{ landscape: isLandscapeMode }">
      <!-- Settings Button -->
      <button v-haptic class="settings-btn" @click="goToSettings" aria-label="Settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 1v6m0 6v6m6.364-13.364L15.536 8.464M8.464 15.536l-2.828 2.828M23 12h-6m-6 0H5m15.364 5.364l-2.828-2.828M8.464 8.464L5.636 5.636"
          />
        </svg>
      </button>

      <!-- Adaptive Header -->
      <header class="home-header">
        <ClockDisplay :is-compact="isLandscapeMode" />
      </header>

      <!-- App Grid/Carousel -->
      <div class="apps-wrapper">
        <AppGrid
          :apps="enabledApps"
          :layout="gridLayout"
          :columns="gridColumns"
        />
      </div>
    </div>

  </HomeLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import HomeLayout from '@/layouts/HomeLayout.vue'
import AppGrid from '@/components/home/AppGrid.vue'
import ClockDisplay from '@/components/common/ClockDisplay.vue'
import { useAppStore } from '@/stores/appRegistry'
import { useOrientation } from '@/composables/useOrientation'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

const router = useRouter()
const appStore = useAppStore()
const enabledApps = computed(() => appStore.enabledApps)

const { isLandscape, isPortrait } = useOrientation()
const { isMobile, isTablet } = useDeviceDetection()

// Only allow landscape mode on mobile/tablet, never on desktop
const isLandscapeMode = computed(() => {
  return isLandscape.value && (isMobile.value || isTablet.value)
})

const gridLayout = computed(() => {
  return isLandscapeMode.value ? 'carousel' : 'grid'
})

const gridColumns = computed(() => {
  if (isLandscapeMode.value) {
    return isMobile.value ? 3 : 4
  }
  // Desktop/Pi5 gets more columns
  if (!isMobile.value && !isTablet.value) {
    return 4 // Desktop: 4 columns
  }
  if (isTablet.value) {
    return 3 // Tablet: 3 columns
  }
  return 2 // Mobile: 2 columns
})

function goToSettings() {
  router.push('/settings')
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: var(--safe-top);
  padding-bottom: calc(40px + var(--safe-bottom));
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

/* Only apply landscape layout on mobile/tablet, not desktop */
@media (max-width: 1024px) {
  .home-container.landscape {
    flex-direction: row;
    gap: 20px;
    padding-bottom: calc(20px + var(--safe-bottom));
    min-height: 100vh;
  }
}

.settings-btn {
  position: fixed;
  top: calc(16px + var(--safe-top));
  right: 16px;
  width: 44px;
  height: 44px;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;

  /* Enhanced glassmorphism */
  background: var(--glass-bg-primary);
  backdrop-filter: var(--glass-blur-medium);
  -webkit-backdrop-filter: var(--glass-blur-medium);

  border-radius: 50%;
  border: var(--glass-border);
  box-shadow: var(--glass-shadow-md);

  color: rgba(60, 60, 67, 0.8);
  transition: all 0.3s var(--spring-bounce);
  touch-action: auto;
}

.settings-btn:active {
  transform: scale(0.92);
  box-shadow: var(--glass-shadow-sm);
}

.settings-btn svg {
  width: 24px;
  height: 24px;
}

.home-header {
  padding: 24px 20px;
  text-align: center;
  transition: all 0.3s var(--spring-smooth);
}

/* Only apply landscape header rotation on mobile/tablet, not desktop */
@media (max-width: 1024px) {
  .home-container.landscape .home-header {
    padding: 16px;
    writing-mode: vertical-lr;
    transform: rotate(180deg);
    flex-shrink: 0;
  }
}

.apps-wrapper {
  width: 100%;
  max-width: 500px;
  padding: 0 20px;
}

/* Desktop/Pi5 - wider container for 4 columns */
@media (min-width: 1024px) {
  .apps-wrapper {
    max-width: 700px;
  }
}

.home-container.landscape .apps-wrapper {
  flex: 1;
  overflow-x: auto;
  max-width: none;
}
</style>
