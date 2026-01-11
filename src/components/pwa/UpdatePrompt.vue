<template>
  <Transition name="fade">
    <div v-if="needRefresh && !dismissed" class="update-prompt">
      <div class="update-content">
        <div class="update-text">
          <strong>New version available!</strong>
          <span>Reload to update</span>
        </div>

        <div class="update-actions">
          <button
            v-haptic
            @click="handleUpdate"
            class="btn-update"
          >
            Update
          </button>
          <button
            v-haptic
            @click="handleDismiss"
            class="btn-close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePWA } from '@/composables/usePWA'

const { needRefresh, updateServiceWorker } = usePWA()
const dismissed = ref(false)

const handleUpdate = async () => {
  await updateServiceWorker(true)
  window.location.reload()
}

const handleDismiss = () => {
  dismissed.value = true
}
</script>

<style scoped>
.update-prompt {
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  right: var(--space-4);
  z-index: 50;
  background: var(--color-info-solid);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--depth-3-shadow);
  padding: var(--space-4);
}

.update-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.update-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.update-text strong {
  font-weight: var(--font-weight-semibold);
}

.update-text span {
  font-size: var(--font-size-14);
  opacity: 0.9;
}

.update-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-update {
  padding: var(--space-2) var(--space-4);
  background: white;
  color: var(--color-info-solid);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-update:active {
  transform: scale(0.95);
  background: var(--color-info-bg);
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-24);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.btn-close:active {
  transform: scale(0.95);
  background: #4f46e5;
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
