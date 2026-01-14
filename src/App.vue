<template>
  <div id="app">
    <InstallPrompt />
    <UpdatePrompt />
    <ProjectKeyModal />
    <ProjectJoinModal />
    <AuthOrchestrator />
    <TimerFloatingPill />
    <TimerCompletionModal />
    <ScreensaverOverlay />
    <PwaMigrationModal :show="showPwaMigration" @close="showPwaMigration = false" />
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'slide'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import InstallPrompt from '@/components/pwa/InstallPrompt.vue'
import UpdatePrompt from '@/components/pwa/UpdatePrompt.vue'
import ProjectKeyModal from '@/components/common/ProjectKeyModal.vue'
import ProjectJoinModal from '@/components/pwa/ProjectJoinModal.vue'
import AuthOrchestrator from '@/components/auth/AuthOrchestrator.vue'
import TimerFloatingPill from '@/components/timer/TimerFloatingPill.vue'
import TimerCompletionModal from '@/components/timer/TimerCompletionModal.vue'
import ScreensaverOverlay from '@/components/screensaver/ScreensaverOverlay.vue'
import PwaMigrationModal from '@/components/pwa/PwaMigrationModal.vue'
import { useTimerStore } from '@/apps/timer/stores/timerStore'
import { useTimerEngine } from '@/apps/timer/composables/useTimerEngine'
import { useAuthStore } from '@/stores/authStore'
import { usePwaStorage } from '@/composables/usePwaStorage'
import { useConfiguration } from '@/composables/useConfiguration'

// Initialize timer engine globally
const timerStore = useTimerStore()
useTimerEngine(timerStore)

// Initialize PWA storage handling
const pwaStorage = usePwaStorage()
const showPwaMigration = ref(false)

// Initialize authentication
const authStore = useAuthStore()
onMounted(async () => {
  // STEP 1: Initialize PWA storage
  pwaStorage.initialize()

  // Show migration modal if needed
  showPwaMigration.value = pwaStorage.needsMigration.value

  // STEP 2: Initialize auth
  await authStore.initializeAuth()
})
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
