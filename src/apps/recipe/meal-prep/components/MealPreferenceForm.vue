<template>
  <div class="meal-preference-form">
    <!-- User Input (Optional) -->
    <div class="user-input-section">
      <div class="input-wrapper">
        <textarea
          v-model="localUserInput"
          placeholder="Additional notes (optional): dietary restrictions, preferences, etc..."
          class="user-input"
          rows="2"
        />
        <MicrophoneButton
          ref="userInputMic"
          v-model="localUserInput"
          inputType="textarea"
          @error="handleMicError"
          class="mic-inside-input"
        />
      </div>
    </div>

    <!-- Meal Preferences -->
    <div class="preferences-section">
      <div class="section-header">
        <h3 class="section-title">Meal Preferences</h3>
        <span class="preference-count">{{ mealPreferences.length }}</span>
      </div>

      <div class="preferences-list">
        <div
          v-for="(preference, index) in mealPreferences"
          :key="index"
          class="preference-card"
        >
          <button
            @click="toggleExpanded(index)"
            class="card-header"
          >
            <div class="header-left">
              <span class="meal-number">{{ index + 1 }}</span>
              <span v-if="preference.type" class="meal-type-badge">
                {{ formatMealType(preference.type) }}
              </span>
              <span v-else class="meal-type-badge incomplete">Not configured</span>
              <span v-if="preference.attributes.length > 0" class="attributes-count">
                {{ preference.attributes.length }} attribute{{ preference.attributes.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="header-right">
              <button
                v-if="mealPreferences.length > 1"
                @click.stop="removePreference(index)"
                class="remove-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="remove-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                :class="['expand-icon', { rotated: expandedIndex === index }]"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </button>

          <Transition name="slide">
            <div v-if="expandedIndex === index" class="card-content">
              <MealTypeSelector v-model="preference.type" />
              <PrepTimeInput v-model="preference.preparationTime" />
              <AttributeSelector v-model="preference.attributes" />
            </div>
          </Transition>
        </div>
      </div>

      <button @click="addPreference" class="add-button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="add-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Dish
      </button>
    </div>

    <!-- Submit Button -->
    <div class="submit-section">
      <button
        @click="handleSubmit"
        :disabled="!isValid"
        class="submit-button"
      >
        Generate Plan
      </button>
      <p v-if="validationError" class="error-message">{{ validationError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MealTypeSelector from './MealTypeSelector.vue'
import PrepTimeInput from './PrepTimeInput.vue'
import AttributeSelector from './AttributeSelector.vue'
import MicrophoneButton from '@/components/common/MicrophoneButton.vue'
import { MealType, formatMealType, type MealPreference } from '../types'

const props = defineProps<{
  userInput: string
  preferences: MealPreference[]
}>()

const emit = defineEmits<{
  'update:userInput': [value: string]
  'update:preferences': [value: MealPreference[]]
  submit: []
}>()

const localUserInput = ref(props.userInput)
const mealPreferences = ref<MealPreference[]>(
  props.preferences.length > 0
    ? props.preferences
    : [createEmptyPreference()]
)
const expandedIndex = ref<number>(0) // Start with first item expanded
const userInputMic = ref<InstanceType<typeof MicrophoneButton> | null>(null)

watch(localUserInput, (newValue) => {
  emit('update:userInput', newValue)
})

watch(
  mealPreferences,
  (newValue) => {
    emit('update:preferences', newValue)
  },
  { deep: true }
)

function createEmptyPreference(): MealPreference {
  return {
    type: null as any,
    preparationTime: 30,
    attributes: []
  }
}

function toggleExpanded(index: number) {
  expandedIndex.value = expandedIndex.value === index ? -1 : index
}

function addPreference() {
  mealPreferences.value.push(createEmptyPreference())
  // Auto-expand the newly added preference
  expandedIndex.value = mealPreferences.value.length - 1
}

function removePreference(index: number) {
  mealPreferences.value.splice(index, 1)
  // Adjust expanded index if necessary
  if (expandedIndex.value >= mealPreferences.value.length) {
    expandedIndex.value = mealPreferences.value.length - 1
  }
}

const validationError = computed(() => {
  if (mealPreferences.value.length === 0) {
    return 'At least one meal preference is required'
  }

  for (let i = 0; i < mealPreferences.value.length; i++) {
    const pref = mealPreferences.value[i]
    if (!pref.type) {
      return `Meal ${i + 1}: Please select a meal type`
    }
    if (pref.preparationTime < 1) {
      return `Meal ${i + 1}: Preparation time must be at least 1 minute`
    }
    if (pref.attributes.length === 0) {
      return `Meal ${i + 1}: Please select at least one attribute`
    }
  }

  return null
})

const isValid = computed(() => validationError.value === null)

function handleSubmit() {
  if (isValid.value) {
    // Stop microphone when submitting
    userInputMic.value?.stopListening()
    emit('submit')
  }
}

function handleMicError(message: string) {
  console.error('Microphone error:', message)
}
</script>

<style scoped>
.meal-preference-form {
  @apply flex flex-col gap-6;
}

.user-input-section {
  @apply flex flex-col;
}

.input-wrapper {
  @apply relative;
}

.user-input {
  @apply px-4 py-2 rounded-lg border-2 border-gray-300
         text-sm text-gray-800 focus:outline-none
         focus:border-emerald-500 transition-all duration-200
         resize-none;
  padding-right: 52px; /* Make room for microphone button */
}

.mic-inside-input {
  @apply absolute top-1/2 right-2 -translate-y-1/2;
}

.preferences-section {
  @apply flex flex-col gap-3;
}

.section-header {
  @apply flex items-center justify-between mb-2;
}

.section-title {
  @apply text-xl font-bold text-gray-800;
}

.preference-count {
  @apply w-8 h-8 flex items-center justify-center
         bg-emerald-600 text-white rounded-full
         text-sm font-bold;
}

.preferences-list {
  @apply flex flex-col gap-2;
}

.preference-card {
  @apply bg-white rounded-lg border-2 border-gray-200
         overflow-hidden transition-all duration-200
         hover:border-emerald-300;
}

.card-header {
  @apply w-full flex items-center justify-between p-3
         cursor-pointer hover:bg-gray-50 transition-all duration-200;
  min-height: 56px;
}

.header-left {
  @apply flex items-center gap-2 flex-1;
}

.meal-number {
  @apply w-7 h-7 flex items-center justify-center
         bg-emerald-600 text-white rounded-full
         text-sm font-bold flex-shrink-0;
}

.meal-type-badge {
  @apply px-3 py-1 bg-emerald-100 text-emerald-700
         rounded-full text-sm font-semibold;
}

.meal-type-badge.incomplete {
  @apply bg-gray-100 text-gray-500 italic;
}

.attributes-count {
  @apply px-2 py-1 bg-gray-100 text-gray-600
         rounded text-xs font-medium;
}

.header-right {
  @apply flex items-center gap-2;
}

.remove-button {
  @apply p-2 rounded-lg text-red-600 hover:bg-red-50
         transition-all duration-200;
  min-height: 40px;
  min-width: 40px;
}

.remove-icon {
  @apply w-4 h-4;
}

.expand-icon {
  @apply w-5 h-5 text-gray-600 transition-transform duration-200;
}

.expand-icon.rotated {
  @apply rotate-180;
}

.card-content {
  @apply flex flex-col gap-4 p-4 pt-0;
}

.add-button {
  @apply flex items-center justify-center gap-2 py-3 px-6
         bg-emerald-50 text-emerald-700 font-semibold rounded-lg
         border-2 border-emerald-300 hover:bg-emerald-100
         transition-all duration-200;
  min-height: 52px;
}

.add-icon {
  @apply w-5 h-5;
}

.submit-section {
  @apply flex flex-col gap-2 mt-2;
}

.submit-button {
  @apply w-full py-3 px-6 bg-emerald-600 text-white font-bold
         text-lg rounded-lg hover:bg-emerald-700
         transition-all duration-200 disabled:opacity-50
         disabled:cursor-not-allowed disabled:hover:bg-emerald-600;
  min-height: 52px;
}

.error-message {
  @apply text-red-600 text-sm font-medium text-center;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
