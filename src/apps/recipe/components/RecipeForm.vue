<template>
  <div class="recipe-form-card">
    <h2 class="form-title">What would you like to cook?</h2>

    <form @submit.prevent="submit" class="form-content">
      <div class="form-group">
        <label for="dish" class="form-label">Dish Name</label>
        <div class="input-wrapper">
          <input
            id="dish"
            v-model="dishName"
            type="text"
            class="form-input"
            placeholder="e.g., Spaghetti Carbonara"
            required
            autofocus
          />
          <MicrophoneButton
            ref="dishNameMic"
            v-model="dishName"
            inputType="input"
            @error="handleMicError"
            class="mic-inside-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="question" class="form-label">Question</label>
        <div class="input-wrapper">
          <textarea
            id="question"
            v-model="question"
            class="form-textarea"
            rows="4"
            required
          ></textarea>
          <MicrophoneButton
            ref="questionMic"
            v-model="question"
            inputType="textarea"
            @error="handleMicError"
            class="mic-inside-input"
          />
        </div>
      </div>

      <button
        type="submit"
        class="submit-button"
        :disabled="!dishName.trim() || !question.trim()"
      >
        Find Recipe
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MicrophoneButton from '@/components/common/MicrophoneButton.vue'

const emit = defineEmits<{
  submit: [dish: string, question: string]
}>()

const dishName = ref('')
const question = ref('What are the ingredients and how do I make this?')
const dishNameMic = ref<InstanceType<typeof MicrophoneButton> | null>(null)
const questionMic = ref<InstanceType<typeof MicrophoneButton> | null>(null)

function submit() {
  // Stop any active microphones when submitting
  dishNameMic.value?.stopListening()
  questionMic.value?.stopListening()

  emit('submit', dishName.value.trim(), question.value.trim())
}

function handleMicError(message: string) {
  console.error('Microphone error:', message)
}
</script>

<style scoped>
.recipe-form-card {
  max-width: 42rem;
  margin: 0 auto;
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  margin-top: var(--space-8);
}

.form-title {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  display: block;
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

.input-wrapper {
  position: relative;
}

.form-input, .form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-18);
  border: 2px solid var(--color-border-secondary);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  outline: none;
  padding-right: 52px;
}

.form-input:focus, .form-textarea:focus {
  border-color: var(--color-success-solid);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.mic-inside-input {
  position: absolute;
  top: 50%;
  right: var(--space-2);
  transform: translateY(-50%);
}

.submit-button {
  width: 100%;
  padding: var(--space-4);
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: white;
  background: var(--color-success-solid);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
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
