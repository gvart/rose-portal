<template>
  <div id="app">
    <InstallPrompt />
    <UpdatePrompt />
    <ConfigurationModal />
    <TimerFloatingPill />
    <TimerCompletionModal />
    <ScreensaverOverlay />
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'slide'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import InstallPrompt from '@/components/pwa/InstallPrompt.vue'
import UpdatePrompt from '@/components/pwa/UpdatePrompt.vue'
import ConfigurationModal from '@/components/common/ConfigurationModal.vue'
import TimerFloatingPill from '@/components/timer/TimerFloatingPill.vue'
import TimerCompletionModal from '@/components/timer/TimerCompletionModal.vue'
import ScreensaverOverlay from '@/components/screensaver/ScreensaverOverlay.vue'
import { useTimerStore } from '@/apps/timer/stores/timerStore'
import { useTimerEngine } from '@/apps/timer/composables/useTimerEngine'

// Initialize timer engine globally
const timerStore = useTimerStore()
useTimerEngine(timerStore)
</script>

<style scoped>
#app {
  @apply min-h-screen w-full;
  overflow-x: hidden;
}

/* Slide transition - forward navigation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s var(--spring-smooth);
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}

/* Slide back transition - back navigation */
.slide-back-enter-active,
.slide-back-leave-active {
  transition: all 0.4s var(--spring-smooth);
}

.slide-back-enter-from {
  transform: translateX(-30%);
  opacity: 0;
}

.slide-back-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-back-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-back-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Fade transition - for home screen */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
