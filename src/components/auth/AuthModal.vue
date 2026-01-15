<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay">
        <div class="modal-container">
          <!-- Modal Header -->
          <div class="modal-header">
            <button
              v-if="canGoBack"
              v-haptic
              class="back-button"
              @click="goBack"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h2 class="modal-title">{{ modalTitle }}</h2>
            <div class="header-spacer"></div>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <!-- Step 1: Username Input -->
            <div v-if="currentStep === 'username'" class="step-container">
              <p class="step-description">
                {{ mode === 'signup' ? 'Choose a username for your profile' : 'Enter your username' }}
              </p>

              <div class="username-display" @click="!isMobileOrTablet && (showKeyboard = true)">
                <input
                  ref="usernameInputRef"
                  v-model="username"
                  type="text"
                  class="text-input"
                  :placeholder="mode === 'signup' ? 'Your Name' : 'Username'"
                  :readonly="!isMobileOrTablet"
                />
              </div>

              <button
                v-haptic
                :disabled="!username.trim()"
                class="btn-primary"
                @click="nextStep"
              >
                Continue
              </button>
            </div>

            <!-- Step 2: PIN Input -->
            <div v-else-if="currentStep === 'pin'" class="step-container">
              <p class="step-description">
                {{ mode === 'signup' ? 'Create a 4-digit PIN' : `Enter PIN for ${username}` }}
              </p>

              <PinInput
                v-model="pin"
                :error="pinError"
                @complete="handlePinComplete"
              />
            </div>

            <!-- Loading State -->
            <div v-else-if="currentStep === 'loading'" class="step-container">
              <div class="loading-spinner">
                <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p class="loading-text">{{ loadingText }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Keyboard (Desktop only) -->
    <FloatingKeyboard
      v-if="!isMobileOrTablet"
      v-model="username"
      v-model:show="showKeyboard"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import PinInput from './PinInput.vue'
import FloatingKeyboard from '@/components/common/FloatingKeyboard.vue'

type AuthMode = 'signin' | 'signup' | 'quick-login'
type AuthStep = 'username' | 'pin' | 'loading'

interface Props {
  show: boolean
  mode: AuthMode
  prefilledUsername?: string
  userId?: string // For quick-login mode
  showBackToSelection?: boolean // Show back button to return to user selection
}

const props = withDefaults(defineProps<Props>(), {
  prefilledUsername: '',
  userId: '',
  showBackToSelection: false
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  success: []
  'back-to-selection': []
}>()

const authStore = useAuthStore()
const { isMobileOrTablet } = useDeviceDetection()

// State
const currentStep = ref<AuthStep>('username')
const username = ref('')
const pin = ref('')
const pinError = ref('')
const showKeyboard = ref(false)
const usernameInputRef = ref<HTMLInputElement | null>(null)

// Computed
const modalTitle = computed(() => {
  if (props.mode === 'signup') return 'Create Account'
  if (props.mode === 'quick-login') return 'Confirm PIN'
  return 'Sign In'
})

const canGoBack = computed(() => {
  // Can go back from PIN step to username (except in quick-login)
  if (currentStep.value === 'pin' && props.mode !== 'quick-login') {
    return true
  }
  // Can go back from username step to user selection if enabled
  if (currentStep.value === 'username' && props.showBackToSelection) {
    return true
  }
  return false
})

const loadingText = computed(() => {
  return props.mode === 'signup' ? 'Creating your account...' : 'Signing in...'
})

// Watch for prefilled username
watch(() => props.show, async (isShowing) => {
  if (isShowing) {
    reset()

    if (props.prefilledUsername) {
      username.value = props.prefilledUsername
      currentStep.value = 'pin'
    } else if (props.mode === 'quick-login') {
      currentStep.value = 'pin'
    } else {
      currentStep.value = 'username'
    }
  }
})

function reset(): void {
  username.value = props.prefilledUsername || ''
  pin.value = ''
  pinError.value = ''
  showKeyboard.value = false
  currentStep.value = 'username'
}

function nextStep(): void {
  if (currentStep.value === 'username' && username.value.trim()) {
    currentStep.value = 'pin'
  }
}

function goBack(): void {
  if (currentStep.value === 'pin') {
    currentStep.value = 'username'
    pin.value = ''
    pinError.value = ''
  } else if (currentStep.value === 'username' && props.showBackToSelection) {
    emit('back-to-selection')
  }
}

async function handlePinComplete(completedPin: string): Promise<void> {
  pinError.value = ''
  currentStep.value = 'loading'

  try {
    if (props.mode === 'signup') {
      await authStore.signup({
        username: username.value.trim(),
        pin: completedPin
      })
    } else if (props.mode === 'quick-login' && props.userId) {
      await authStore.quickLogin(props.userId, completedPin)
    } else {
      await authStore.login({
        username: username.value.trim(),
        pin: completedPin
      })
    }

    emit('success')
    emit('update:show', false)
  } catch (error) {
    currentStep.value = 'pin'
    pin.value = ''
    pinError.value = error instanceof Error ? error.message : 'Authentication failed'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: var(--space-4);
}

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

.modal-header {
  position: sticky;
  top: 0;
  background: var(--color-bg-primary);
  border-bottom: var(--depth-1-border);
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  z-index: 1;
}

.back-button {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
}

.back-button:active {
  background: var(--color-bg-tertiary);
}

.header-spacer {
  width: 36px;
  height: 36px;
}

.modal-title {
  flex: 1;
  font-size: var(--font-size-20);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: center;
}

.modal-content {
  padding: var(--space-6);
}

.step-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
}

.step-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  text-align: center;
}

.username-display {
  width: 100%;
}

.text-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-16);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--color-accent-primary);
}

.loading-text {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
}
</style>
