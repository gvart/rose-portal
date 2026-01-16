<template>
  <q-dialog :model-value="show" @update:model-value="val => $emit('update:show', val)" persistent>
    <q-card class="auth-modal-card">
      <q-card-section class="modal-header">
        <q-btn
          v-if="canGoBack"
          icon="arrow_back"
          flat
          round
          dense
          @click="goBack"
        />
        <div class="text-h6 text-center flex-1">{{ modalTitle }}</div>
        <div v-if="!canGoBack" class="header-spacer"></div>
      </q-card-section>

      <q-card-section class="modal-content">
            <!-- Step 1: Username Input -->
            <div v-if="currentStep === 'username'" class="step-container">
              <p class="step-description">
                {{ mode === 'signup' ? 'Choose a username for your profile' : 'Enter your username' }}
              </p>

              <q-input
                ref="usernameInputRef"
                v-model="username"
                type="text"
                outlined
                :placeholder="mode === 'signup' ? 'Your Name' : 'Username'"
                :readonly="isPi5"
                @click="isPi5 && (showKeyboard = true)"
                class="q-mb-md"
              />

              <q-btn
                label="Continue"
                color="primary"
                unelevated
                :disable="!username.trim()"
                @click="nextStep"
                class="full-width"
              />
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
          <q-spinner color="primary" size="48px" />
          <p class="loading-text q-mt-md">{{ loadingText }}</p>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- On-Screen Keyboard (Pi5 only) -->
  <Teleport to="body">
    <FloatingKeyboard
      v-if="isPi5"
      v-model="username"
      v-model:show="showKeyboard"
      :docked="true"
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
  userId?: string | number // For quick-login mode
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
const { isMobileOrTablet, isPi5 } = useDeviceDetection()

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
    showKeyboard.value = false
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
.auth-modal-card {
  max-width: 448px;
  width: 100%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.header-spacer {
  width: 36px;
  height: 36px;
}

.step-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
  width: 100%;
}

.step-description {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  text-align: center;
}

.loading-text {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  text-align: center;
}

.flex-1 {
  flex: 1;
}

/* Ultra-compact optimizations for Pi5 */
@media (max-height: 768px) {
  .auth-modal-card {
    max-height: 70vh !important; /* Smaller since it's simple */
  }

  .step-container {
    gap: var(--space-4);
  }

  .step-description {
    font-size: 12px;
  }

  .loading-text {
    font-size: 12px;
  }
}
</style>
