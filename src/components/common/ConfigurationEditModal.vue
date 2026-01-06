<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button
              v-haptic:light
              type="button"
              class="close-button"
              @touchend.prevent="closeModal"
              @click.prevent="closeModal"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <div class="input-section">
              <label class="input-label" for="url-input">URL</label>
              <input
                id="url-input"
                ref="urlInputRef"
                v-model="localUrl"
                type="url"
                class="text-input"
                :placeholder="placeholder"
                @keydown.enter="handleSave"
              />
              <p v-if="error" class="input-error">
                {{ error }}
              </p>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button
              v-haptic
              @click="closeModal"
              class="btn-secondary"
            >
              Cancel
            </button>
            <button
              v-haptic
              :disabled="!isValid"
              @click="handleSave"
              class="btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useConfiguration } from '@/composables/useConfiguration'

interface Props {
  modelValue: boolean
  title: string
  currentValue: string
  placeholder: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [url: string]
}>()

const { validateUrl } = useConfiguration()

const localUrl = ref('')
const error = ref('')
const urlInputRef = ref<HTMLInputElement | null>(null)

const isValid = computed(() => {
  return localUrl.value.trim() !== '' && validateUrl(localUrl.value)
})

// Watch for modal open/close
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    localUrl.value = props.currentValue
    error.value = ''
    // Auto-focus the input when modal opens
    await nextTick()
    urlInputRef.value?.focus()
  }
})

function closeModal() {
  emit('update:modelValue', false)
}

function handleOverlayClick() {
  closeModal()
}

function handleSave() {
  error.value = ''

  if (!isValid.value) {
    error.value = 'Please enter a valid URL (http://, https://, ws://, or wss://)'
    return
  }

  emit('save', localUrl.value)
  closeModal()
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4;
}

/* Modal Container */
.modal-container {
  @apply w-full max-w-md bg-white rounded-2xl shadow-2xl;
}

/* Modal Header */
.modal-header {
  @apply flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl;
}

.modal-title {
  @apply text-xl font-bold text-gray-900;
}

.close-button {
  @apply p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
         transition-all duration-150 active:scale-95;
}

/* Modal Content */
.modal-content {
  @apply px-6 py-4;
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

.input-error {
  @apply text-xs text-red-600 mt-1 font-medium;
}

/* Modal Actions */
.modal-actions {
  @apply flex gap-3 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl;
}

.btn-secondary,
.btn-primary {
  @apply flex-1 px-6 py-3 font-semibold rounded-lg
         transition-all duration-150 active:scale-95
         focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500
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
