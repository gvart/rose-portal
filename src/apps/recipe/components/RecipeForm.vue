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
  @apply max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8;
}

.form-title {
  @apply text-3xl font-bold text-gray-800 mb-6;
}

.form-content {
  @apply space-y-6;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-lg font-semibold text-gray-700;
}

.input-wrapper {
  @apply relative;
}

.form-input, .form-textarea {
  @apply w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg
         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
         transition-all duration-200 outline-none;
  padding-right: 52px; /* Make room for microphone button */
}

.mic-inside-input {
  @apply absolute top-1/2 right-2 -translate-y-1/2;
}

.submit-button {
  @apply w-full py-4 text-xl font-bold text-white bg-emerald-600
         rounded-lg hover:bg-emerald-700 disabled:bg-gray-300
         disabled:cursor-not-allowed transition-all duration-200
         shadow-lg hover:shadow-xl;
}
</style>
