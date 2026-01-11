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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: var(--space-16) 0;
}

.input-card {
  max-width: 42rem;
  width: 100%;
  margin: 0 auto;
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  margin-top: var(--space-8);
}

.input-title {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
}

.input-wrapper {
  position: relative;
}

.description-input {
  width: 100%;
  padding: var(--space-4);
  font-size: var(--font-size-18);
  border: 2px solid var(--color-border-secondary);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  outline: none;
  min-height: 56px;
  padding-right: 52px;
}

.description-input:focus {
  border-color: var(--color-success-solid);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.mic-inside-input {
  position: absolute;
  top: 50%;
  right: var(--space-2);
  transform: translateY(-50%);
}

.suggestions-section {
  margin-top: var(--space-6);
}

.suggestions-label {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.suggestions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.submit-button {
  width: 100%;
  margin-top: var(--space-6);
  padding: var(--space-4);
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: white;
  background: var(--color-success-solid);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 56px;
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
  background: #059669;
}

.submit-button:disabled {
  background: var(--color-border-secondary);
  cursor: not-allowed;
}
</style>
