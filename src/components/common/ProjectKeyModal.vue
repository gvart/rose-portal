<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="shouldShow && !isInstallFlow" class="modal-overlay" @click.stop>
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">Enter Project Key</h2>
            <p class="modal-subtitle">
              Enter your ROSE project key to get started
            </p>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <div class="input-section">
              <label class="input-label" for="project-key">Project Key</label>
              <input
                id="project-key"
                ref="projectKeyInputRef"
                v-model="projectKey"
                type="text"
                class="text-input"
                placeholder="Enter your project key"
                @keydown.enter="handleValidate"
              />
              <p v-if="error" class="input-error">{{ error }}</p>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button
              v-haptic
              :disabled="!projectKey.trim() || isValidating"
              @click="handleValidate"
              class="btn-primary"
            >
              {{ isValidating ? 'Validating...' : 'Continue' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useConfiguration } from '@/composables/useConfiguration'
import { projectService } from '@/services/projectService'

const route = useRoute()
const { getProjectKey, setProjectKey } = useConfiguration()

const shouldShow = ref(false)
const projectKey = ref('')
const error = ref('')
const isValidating = ref(false)
const projectKeyInputRef = ref<HTMLInputElement | null>(null)

// Check if running as PWA
const isPWA = computed(() => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
})

// Check if currently in install flow
const isInstallFlow = computed(() => {
  return route.path === '/install' || route.query.action === 'install'
})

onMounted(async () => {
  // Don't show on install page or when navigating to install
  if (route.path === '/install' || route.query.action === 'install') {
    return
  }

  // Only show on web/desktop (not PWA) when no projectKey exists
  const hasProjectKey = !!getProjectKey()

  if (!isPWA.value && !hasProjectKey) {
    shouldShow.value = true
    await nextTick()
    projectKeyInputRef.value?.focus()
  }
})

async function handleValidate() {
  if (!projectKey.value.trim()) return

  error.value = ''
  isValidating.value = true

  try {
    console.log('[ProjectKeyModal] Validating project key:', projectKey.value.trim())
    const exists = await projectService.validateKey(projectKey.value.trim())
    console.log('[ProjectKeyModal] Validation result:', exists)

    if (exists) {
      console.log('[ProjectKeyModal] Setting project key')
      setProjectKey(projectKey.value.trim())
      console.log('[ProjectKeyModal] Project key set, closing modal')
      shouldShow.value = false
    } else {
      error.value = 'Invalid project key. Please check and try again.'
    }
  } catch (err) {
    error.value = 'Failed to validate project key. Please try again.'
    console.error('Project key validation error:', err)
  } finally {
    isValidating.value = false
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
