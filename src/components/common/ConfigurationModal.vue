<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="shouldShow" class="modal-overlay" @click.stop>
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">Configure ROSE</h2>
            <p class="modal-subtitle">
              Set your backend API and Vosk WebSocket URLs to get started
            </p>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <!-- Backend URL Input -->
            <div class="input-section">
              <label class="input-label" for="backend-url">Backend API URL</label>
              <input
                id="backend-url"
                ref="backendInputRef"
                v-model="backendUrl"
                type="url"
                class="text-input"
                placeholder="https://your-server.com:8080"
                @keydown.enter="handleSave"
              />
              <p class="input-hint">
                Example: https://192.168.1.100:8080 or http://raspberrypi.local:8080
              </p>
              <p v-if="backendError" class="input-error">
                {{ backendError }}
              </p>
            </div>

            <!-- Vosk URL Input -->
            <div class="input-section">
              <label class="input-label" for="vosk-url">Vosk WebSocket URL</label>
              <input
                id="vosk-url"
                v-model="voskUrl"
                type="url"
                class="text-input"
                placeholder="wss://your-server.com:2700"
                @keydown.enter="handleSave"
              />
              <p class="input-hint">
                Example: wss://192.168.1.100:2700 or ws://raspberrypi.local:2700
              </p>
              <p v-if="voskError" class="input-error">
                {{ voskError }}
              </p>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button
              v-haptic
              :disabled="!isValid"
              @click="handleSave"
              class="btn-primary"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useConfiguration } from '@/composables/useConfiguration'

const { isConfigured, setBackendUrl, setVoskUrl, validateUrl } = useConfiguration()

const shouldShow = ref(false)
const backendUrl = ref('')
const voskUrl = ref('')
const backendError = ref('')
const voskError = ref('')
const backendInputRef = ref<HTMLInputElement | null>(null)

const isValid = computed(() => {
  return (
    backendUrl.value.trim() !== '' &&
    voskUrl.value.trim() !== '' &&
    validateUrl(backendUrl.value) &&
    validateUrl(voskUrl.value)
  )
})

onMounted(async () => {
  // Only show in production mode if not configured
  // In development, Vite proxy handles API calls
  if (!isConfigured.value && import.meta.env.PROD) {
    shouldShow.value = true
    // Auto-focus the first input when modal opens
    await nextTick()
    backendInputRef.value?.focus()
  }
})

function handleSave() {
  backendError.value = ''
  voskError.value = ''

  if (!isValid.value) {
    return
  }

  try {
    setBackendUrl(backendUrl.value)
    setVoskUrl(voskUrl.value)
    shouldShow.value = false
  } catch (error) {
    // Handle validation errors
    const errorMessage = error instanceof Error ? error.message : 'Validation error'
    if (errorMessage.toLowerCase().includes('backend')) {
      backendError.value = errorMessage
    } else if (errorMessage.toLowerCase().includes('vosk')) {
      voskError.value = errorMessage
    } else {
      backendError.value = errorMessage
    }
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4;
}

/* Modal Container */
.modal-container {
  @apply w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto;
}

/* Modal Header */
.modal-header {
  @apply sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900;
}

.modal-subtitle {
  @apply text-sm text-gray-600 mt-1;
}

/* Modal Content */
.modal-content {
  @apply px-6 py-4 space-y-6;
}

/* Input Section */
.input-section {
  @apply space-y-2;
}

.input-label {
  @apply block text-sm font-medium text-gray-700;
}

.text-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
         text-base text-gray-900 placeholder-gray-400
         transition-all duration-150;
}

.input-hint {
  @apply text-xs text-gray-500 mt-1;
}

.input-error {
  @apply text-xs text-red-600 mt-1 font-medium;
}

/* Modal Actions */
.modal-actions {
  @apply sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl;
}

.btn-primary {
  @apply w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg
         transition-all duration-150 active:scale-95
         hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
         disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300 ease-out;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  @apply scale-95 translate-y-4;
}
</style>
