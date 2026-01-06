<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="install-prompt">
      <div class="install-content">
        <div class="install-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>

        <div class="install-text">
          <h3 class="install-title">Install ROSE Smart Hub</h3>
          <p class="install-description">
            Get quick access from your home screen
          </p>
        </div>

        <div class="install-actions">
          <button
            v-haptic
            @click="handleInstall"
            class="btn-install"
          >
            Install
          </button>
          <button
            v-haptic
            @click="handleDismiss"
            class="btn-dismiss"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePWA } from '@/composables/usePWA'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

const { isInstallable, isInstalled, install } = usePWA()
const { isMobile, isTablet } = useDeviceDetection()

const dismissed = ref(false)
const showPrompt = computed(() =>
  (isMobile.value || isTablet.value) &&
  isInstallable.value &&
  !isInstalled.value &&
  !dismissed.value
)

const handleInstall = async () => {
  const success = await install()
  if (success) {
    dismissed.value = true
    localStorage.setItem('pwa-install-dismissed', 'true')
  }
}

const handleDismiss = () => {
  dismissed.value = true
  localStorage.setItem('pwa-install-dismissed', 'true')
  localStorage.setItem('pwa-install-dismissed-at', Date.now().toString())
}

onMounted(() => {
  // Check if user previously dismissed (show again after 7 days)
  const dismissedAt = localStorage.getItem('pwa-install-dismissed-at')
  if (dismissedAt) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
    if (daysSinceDismissed > 7) {
      localStorage.removeItem('pwa-install-dismissed')
      localStorage.removeItem('pwa-install-dismissed-at')
    } else {
      dismissed.value = true
    }
  }
})
</script>

<style scoped>
.install-prompt {
  @apply fixed bottom-0 left-0 right-0 z-50
         bg-white shadow-2xl border-t border-gray-200
         p-4;
}

.install-content {
  @apply flex items-center gap-4 max-w-2xl mx-auto;
}

.install-icon {
  @apply w-12 h-12 flex-shrink-0
         bg-green-500 text-white rounded-xl
         flex items-center justify-center;
}

.install-icon svg {
  @apply w-6 h-6;
}

.install-text {
  @apply flex-1 min-w-0;
}

.install-title {
  @apply font-semibold text-gray-900 text-base;
}

.install-description {
  @apply text-sm text-gray-600 truncate;
}

.install-actions {
  @apply flex gap-2 flex-shrink-0;
}

.btn-install {
  @apply px-4 py-2 bg-green-500 text-white font-medium rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-green-600;
}

.btn-dismiss {
  @apply px-4 py-2 text-gray-600 font-medium rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-gray-100;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
