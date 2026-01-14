<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="shouldShow" class="modal-overlay" @click.stop>
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">Configure ROSE</h2>
            <p class="modal-subtitle">
              Set your backend API URL to get started. Vosk WebSocket URL is optional for voice features.
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
              <label class="input-label" for="vosk-url">
                Vosk WebSocket URL
                <span class="optional-badge">Optional</span>
              </label>
              <input
                id="vosk-url"
                v-model="voskUrl"
                type="url"
                class="text-input"
                placeholder="wss://your-server.com:2700"
                @keydown.enter="handleSave"
              />
              <p class="input-hint">
                Only required for voice features. Example: wss://192.168.1.100:2700
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
import { useRoute } from 'vue-router'
import { useConfiguration } from '@/composables/useConfiguration'

const route = useRoute()
const { isConfigured, setBackendUrl, setVoskUrl, validateUrl } = useConfiguration()

const shouldShow = ref(false)
const backendUrl = ref('')
const voskUrl = ref('')
const backendError = ref('')
const voskError = ref('')
const backendInputRef = ref<HTMLInputElement | null>(null)

const isValid = computed(() => {
  const hasValidBackend = backendUrl.value.trim() !== '' && validateUrl(backendUrl.value)
  const voskUrlEmpty = voskUrl.value.trim() === ''
  const voskUrlValid = voskUrlEmpty || validateUrl(voskUrl.value)

  return hasValidBackend && voskUrlValid
})

onMounted(async () => {
  // Only show in production mode if not configured
  // In development, Vite proxy handles API calls
  // Don't show on /install page as it handles configuration from query params
  // Don't show if action=install query param is present (during redirect)
  const isInstallFlow = route.path === '/install' || route.query.action === 'install'

  if (!isConfigured.value && import.meta.env.PROD && !isInstallFlow) {
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

    // Only set Vosk URL if provided
    if (voskUrl.value.trim() !== '') {
      setVoskUrl(voskUrl.value)
    }

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
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  padding: var(--space-4);
}

/* Modal Container */
.modal-container {
  width: 100%;
  max-width: 448px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  max-height: 90vh;
  overflow-y: auto;
}

/* Modal Header */
.modal-header {
  position: sticky;
  top: 0;
  background: var(--color-bg-primary);
  border-bottom: var(--depth-1-border);
  padding: var(--space-4) var(--space-6);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
}

.modal-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.modal-subtitle {
  font-size: var(--font-size-13);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

/* Modal Content */
.modal-content {
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Input Section */
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  display: block;
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.optional-badge {
  display: inline-block;
  margin-left: var(--space-2);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.text-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.text-input::placeholder {
  color: var(--color-text-faint);
}

.input-hint {
  font-size: var(--font-size-11);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.input-error {
  font-size: var(--font-size-11);
  color: var(--color-error-text);
  margin-top: var(--space-1);
  font-weight: var(--font-weight-medium);
}

/* Modal Actions */
.modal-actions {
  position: sticky;
  bottom: 0;
  background: var(--color-bg-primary);
  border-top: var(--depth-1-border);
  padding: var(--space-4) var(--space-6);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.btn-primary {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  background: var(--color-accent-primary);
  color: white;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
  background: var(--color-accent-primary-active);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(var(--space-4));
  transition: transform var(--duration-slow) var(--ease-in-out);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform var(--duration-slow) var(--ease-in-out);
}
</style>
