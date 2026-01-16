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
           
            @click="handleInstall"
            class="btn-install"
          >
            Install
          </button>
          <button
           
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
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--color-bg-primary);
  box-shadow: var(--depth-4-shadow);
  border-top: 1px solid var(--color-border-primary);
  padding: var(--space-4);
}

.install-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  max-width: 672px;
  margin: 0 auto;
}

.install-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  background: var(--color-success-solid);
  color: white;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.install-icon svg {
  width: 24px;
  height: 24px;
}

.install-text {
  flex: 1;
  min-width: 0;
}

.install-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-16);
}

.install-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.install-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.btn-install {
  padding: var(--space-2) var(--space-4);
  background: var(--color-success-solid);
  color: white;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-install:active {
  transform: scale(0.95);
  background: #059669;
}

.btn-dismiss {
  padding: var(--space-2) var(--space-4);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-dismiss:active {
  transform: scale(0.95);
  background: var(--color-bg-secondary);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform var(--duration-normal) var(--ease-out);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
