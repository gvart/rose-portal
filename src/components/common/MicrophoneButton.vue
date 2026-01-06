<template>
  <button
    @click="toggleListening"
    :class="buttonClasses"
    :disabled="isConnecting"
    type="button"
    :aria-label="isListening ? 'Stop recording' : 'Start recording'"
  >
    <!-- Microphone Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="mic-icon"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
      />
    </svg>

    <!-- Pulse animation overlay when listening -->
    <span v-if="isListening" class="pulse-ring"></span>
  </button>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useVoskSpeechRecognition } from '@/composables/useVoskSpeechRecognition'

const props = defineProps<{
  modelValue: string
  inputType?: 'input' | 'textarea'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  error: [message: string]
}>()

const { isListening, isConnecting, error, startListening, stopListening, cleanup } =
  useVoskSpeechRecognition()

const buttonClasses = computed(() => {
  const baseClasses =
    'mic-button relative flex items-center justify-center transition-all duration-200'

  if (error.value) {
    return `${baseClasses} mic-button-error`
  }

  if (isListening.value) {
    return `${baseClasses} mic-button-listening`
  }

  return `${baseClasses} mic-button-idle`
})

async function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    await startListening((text: string) => {
      // Update the input value with the transcribed text
      emit('update:modelValue', text)
    })
  }
}

// Watch for errors and emit them to parent
watch(error, (newError) => {
  if (newError) {
    emit('error', newError)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  cleanup()
})

// Expose stopListening method to parent components
defineExpose({
  stopListening
})
</script>

<style scoped>
.mic-button {
  @apply rounded-lg flex-shrink-0;
  min-width: 40px;
  min-height: 40px;
  width: 40px;
  height: 40px;
}

.mic-button-idle {
  @apply bg-emerald-600 text-white hover:bg-emerald-700;
}

.mic-button-listening {
  @apply bg-red-500 text-white;
  animation: pulse-bg 2s ease-in-out infinite;
}

.mic-button-error {
  @apply bg-red-500 text-white hover:bg-red-600;
}

.mic-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.mic-icon {
  @apply w-5 h-5 relative z-10;
}

/* Pulse ring animation */
.pulse-ring {
  @apply absolute inset-0 rounded-lg;
  background: rgba(239, 68, 68, 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.9);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(0.9);
    opacity: 1;
  }
}

@keyframes pulse-bg {
  0%, 100% {
    background-color: rgb(239, 68, 68);
  }
  50% {
    background-color: rgb(220, 38, 38);
  }
}
</style>
