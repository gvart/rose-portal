<template>
  <Transition name="fade">
    <div v-if="needRefresh" class="update-prompt">
      <div class="update-content">
        <div class="update-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </div>
        <div class="update-text">
          <strong>New version available!</strong>
          <span>Update now to get the latest features and fixes</span>
        </div>

        <button
          v-haptic
          @click="handleUpdate"
          class="btn-update"
        >
          Update Now
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { usePWA } from '@/composables/usePWA'

const { needRefresh, updateServiceWorker } = usePWA()

const handleUpdate = async () => {
  await updateServiceWorker(true)
  window.location.reload()
}
</script>

<style scoped>
.update-prompt {
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  z-index: 9999; /* Highest priority - above all modals including auth */
  background: var(--color-info-solid);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--depth-4-shadow);
  padding: var(--space-4);
}

.update-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.update-icon {
  flex-shrink: 0;
}

.update-icon svg {
  width: 28px;
  height: 28px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.update-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.update-text strong {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-16);
}

.update-text span {
  font-size: var(--font-size-14);
  opacity: 0.9;
}

.btn-update {
  padding: var(--space-2) var(--space-4);
  background: white;
  color: var(--color-info-solid);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-update:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-normal) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
