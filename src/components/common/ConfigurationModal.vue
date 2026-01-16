<template>
  <q-dialog v-model="shouldShow" persistent>
    <q-card class="configuration-card">
      <q-card-section>
        <div class="text-h5 q-mb-xs">Configure ROSE</div>
        <div class="text-caption text-grey-7">
          Set your backend API URL to get started. Vosk WebSocket URL is optional for voice features.
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form>
          <!-- Backend URL Input -->
          <q-input
            ref="backendInputRef"
            v-model="backendUrl"
            label="Backend API URL"
            type="url"
            outlined
            :error="!!backendError"
            :error-message="backendError"
            @keydown.enter="handleSave"
            autofocus
            class="q-mb-md"
            placeholder="https://your-server.com:8080"
          >
            <template v-slot:hint>
              Example: https://192.168.1.100:8080 or http://raspberrypi.local:8080
            </template>
          </q-input>

          <!-- Vosk URL Input -->
          <q-input
            v-model="voskUrl"
            type="url"
            outlined
            :error="!!voskError"
            :error-message="voskError"
            @keydown.enter="handleSave"
            placeholder="wss://your-server.com:2700"
          >
            <template v-slot:label>
              Vosk WebSocket URL
              <q-chip dense size="sm" color="grey-3" text-color="grey-7" label="Optional" class="q-ml-xs" />
            </template>
            <template v-slot:hint>
              Only required for voice features. Example: wss://192.168.1.100:2700
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          unelevated
          color="primary"
          label="Save Configuration"
          :disabled="!isValid"
          @click="handleSave"
          class="full-width"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
  // NEVER show in production mode (backend is hardcoded)
  // Only show in development mode if not configured
  // Don't show on /install page as it handles configuration from query params
  // Don't show if action=install query param is present (during redirect)
  const isInstallFlow = route.path === '/install' || route.query.action === 'install'

  if (!import.meta.env.PROD && !isConfigured.value && !isInstallFlow) {
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
.configuration-card {
  max-width: 448px;
  width: 100%;
}
</style>
