<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="shouldShow" class="modal-overlay" @click.stop>
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">Join Project</h2>
            <p class="modal-subtitle">
              Enter the invite code from your installation page
            </p>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <div class="input-section">
              <label class="input-label" for="invite-code">Invite Code</label>
              <input
                id="invite-code"
                ref="inviteCodeInputRef"
                v-model="inviteCode"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                class="text-input code-input"
                placeholder="Enter invite code"
                maxlength="20"
                @keydown.enter="handleJoin"
              />
              <p class="input-hint">
                Get this code from the installation page on your desktop/Pi5
              </p>
              <p v-if="error" class="input-error">{{ error }}</p>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button
              v-haptic
              :disabled="!inviteCode.trim() || isJoining"
              @click="handleJoin"
              class="btn-primary"
            >
              {{ isJoining ? 'Joining...' : 'Join Project' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useConfiguration } from '@/composables/useConfiguration'
import { projectService } from '@/services/projectService'

const { getProjectKey, setProjectKey } = useConfiguration()

const shouldShow = ref(false)
const inviteCode = ref('')
const error = ref('')
const isJoining = ref(false)
const inviteCodeInputRef = ref<HTMLInputElement | null>(null)

// Check if running as PWA
const isPWA = computed(() => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
})

onMounted(async () => {
  // Only show for PWA without project key
  const hasProjectKey = !!getProjectKey()

  if (isPWA.value && !hasProjectKey) {
    shouldShow.value = true
    await nextTick()
    inviteCodeInputRef.value?.focus()
  }
})

async function handleJoin() {
  if (!inviteCode.value.trim()) return

  error.value = ''
  isJoining.value = true

  try {
    console.log('[ProjectJoinModal] Attempting to join with code:', inviteCode.value.trim())
    const projectKey = await projectService.joinProject(inviteCode.value.trim())
    console.log('[ProjectJoinModal] Successfully joined, projectKey:', projectKey)
    setProjectKey(projectKey)
    shouldShow.value = false

    // Success! User can now proceed to auth
  } catch (err: any) {
    console.error('[ProjectJoinModal] Join failed:', err)
    console.error('[ProjectJoinModal] Error details:', {
      message: err.message,
      statusCode: err.statusCode,
      response: err.response,
      stack: err.stack
    })

    // Handle specific errors
    if (err.statusCode === 404 || err.statusCode === 400) {
      error.value = 'Invalid or expired invite code. Please check and try again.'
    } else if (err.statusCode === 429) {
      error.value = 'Too many attempts. Please wait a moment and try again.'
    } else {
      // Temporary: Show detailed error for debugging
      const errorMsg = err.message || err.toString()
      error.value = `Failed to join project: ${errorMsg}`
    }
  } finally {
    isJoining.value = false
  }
}
</script>

<style scoped>
/* Modal overlay styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999; /* Higher than other modals */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
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

.code-input {
  font-family: var(--font-mono);
  font-size: var(--font-size-18);
  text-align: center;
  letter-spacing: 2px;
  text-transform: uppercase;
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
