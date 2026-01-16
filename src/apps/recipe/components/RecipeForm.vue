<template>
  <q-card class="recipe-form-card">
    <q-card-section>
      <div class="text-h4 text-weight-bold q-mb-md">What would you like to cook?</div>

      <form @submit.prevent="submit" class="form-content">
        <div class="form-group">
          <label class="form-label">Dish Name</label>
          <q-input
            v-model="dishName"
            type="text"
            outlined
            placeholder="e.g., Spaghetti Carbonara"
            autofocus
          >
            <template v-slot:append>
              <MicrophoneButton
                ref="dishNameMic"
                v-model="dishName"
                inputType="input"
                @error="handleMicError"
              />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <label class="form-label">Question</label>
          <q-input
            v-model="question"
            type="textarea"
            outlined
            :input-style="{ minHeight: '100px' }"
          >
            <template v-slot:append>
              <MicrophoneButton
                ref="questionMic"
                v-model="question"
                inputType="textarea"
                @error="handleMicError"
              />
            </template>
          </q-input>
        </div>

        <q-btn
          type="submit"
          label="Find Recipe"
          color="positive"
          unelevated
          size="lg"
          :disable="!dishName.trim() || !question.trim()"
          class="full-width"
        />
      </form>
    </q-card-section>
  </q-card>
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
  margin-top: var(--space-8);
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
</style>
