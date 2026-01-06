<template>
  <div class="recommendations-input">
    <div class="input-card">
      <h2 class="input-title">What are you in the mood for?</h2>

      <div class="input-wrapper">
        <input
          v-model="description"
          type="text"
          class="description-input"
          placeholder="Describe what you'd like to eat..."
          autofocus
          @keyup.enter="submit"
        />
        <MicrophoneButton
          ref="descriptionMic"
          v-model="description"
          inputType="input"
          @error="handleMicError"
          class="mic-inside-input"
        />
      </div>

      <div class="suggestions-section">
        <p class="suggestions-label">Try something like:</p>
        <div class="suggestions-grid">
          <SuggestionChip
            v-for="suggestion in suggestions"
            :key="suggestion"
            :label="suggestion"
            @click="selectSuggestion(suggestion)"
          />
        </div>
      </div>

      <button
        class="submit-button"
        :disabled="!description.trim()"
        @click="submit"
      >
        Get Recommendations
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SuggestionChip from './SuggestionChip.vue'
import MicrophoneButton from '@/components/common/MicrophoneButton.vue'

const emit = defineEmits<{
  submit: [description: string]
}>()

const description = ref('')
const descriptionMic = ref<InstanceType<typeof MicrophoneButton> | null>(null)

const suggestions = [
  'Quick dinner',
  'Healthy lunch',
  'Comfort food',
  'Italian cuisine',
  'Under 30 minutes',
  'Vegetarian',
  'High protein',
  'Family meal'
]

function selectSuggestion(suggestion: string) {
  description.value = suggestion
}

function submit() {
  if (description.value.trim()) {
    // Stop microphone when submitting
    descriptionMic.value?.stopListening()
    emit('submit', description.value.trim())
  }
}

function handleMicError(message: string) {
  console.error('Microphone error:', message)
}
</script>

<style scoped>
.recommendations-input {
  @apply flex items-center justify-center min-h-full py-12;
}

.input-card {
  @apply max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8;
}

.input-title {
  @apply text-3xl font-bold text-gray-800 mb-6;
}

.input-wrapper {
  @apply relative;
}

.description-input {
  @apply w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg
         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
         transition-all duration-200 outline-none;
  min-height: 56px;
  padding-right: 52px; /* Make room for microphone button */
}

.mic-inside-input {
  @apply absolute top-1/2 right-2 -translate-y-1/2;
}

.suggestions-section {
  @apply mt-6;
}

.suggestions-label {
  @apply text-sm font-medium text-gray-500 mb-3;
}

.suggestions-grid {
  @apply flex flex-wrap gap-2;
}

.submit-button {
  @apply w-full mt-6 py-4 text-xl font-bold text-white bg-emerald-600
         rounded-lg hover:bg-emerald-700 disabled:bg-gray-300
         disabled:cursor-not-allowed transition-all duration-200
         shadow-lg hover:shadow-xl;
  min-height: 56px;
}
</style>
