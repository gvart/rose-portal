<template>
  <div class="recommendations-input">
    <q-card class="input-card">
      <q-card-section>
        <div class="text-h4 text-weight-bold q-mb-md">What are you in the mood for?</div>

        <q-input
          v-model="description"
          type="text"
          outlined
          placeholder="Describe what you'd like to eat..."
          autofocus
          @keyup.enter="submit"
        >
          <template v-slot:append>
            <MicrophoneButton
              ref="descriptionMic"
              v-model="description"
              inputType="input"
              @error="handleMicError"
            />
          </template>
        </q-input>

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

        <q-btn
          label="Get Recommendations"
          color="positive"
          unelevated
          size="lg"
          :disable="!description.trim()"
          @click="submit"
          class="full-width q-mt-md"
        />
      </q-card-section>
    </q-card>
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
  margin-top: var(--space-8);
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
</style>
