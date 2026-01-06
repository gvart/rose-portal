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
  @apply fixed top-4 left-4 right-4 z-50
         bg-blue-500 text-white rounded-lg shadow-lg
         p-4;
}

.update-content {
  @apply flex items-center justify-between gap-4;
}

.update-text {
  @apply flex flex-col gap-1;
}

.update-text strong {
  @apply font-semibold;
}

.update-text span {
  @apply text-sm opacity-90;
}

.update-actions {
  @apply flex items-center gap-2;
}

.btn-update {
  @apply px-4 py-2 bg-white text-blue-500 font-medium rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-blue-50;
}

.btn-close {
  @apply w-8 h-8 flex items-center justify-center
         text-white text-2xl rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-blue-600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
