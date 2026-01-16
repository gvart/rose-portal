<template>
  <div class="meal-preference-form">
    <!-- User Input (Optional) -->
    <div class="user-input-section">
      <q-input
        v-model="localUserInput"
        type="textarea"
        outlined
        placeholder="Additional notes (optional): dietary restrictions, preferences, etc..."
        rows="2"
      >
        <template v-slot:append>
          <MicrophoneButton
            ref="userInputMic"
            v-model="localUserInput"
            inputType="textarea"
            @error="handleMicError"
          />
        </template>
      </q-input>
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
              <q-btn
                v-if="mealPreferences.length > 1"
                icon="close"
                flat
                round
                dense
                color="negative"
                @click.stop="removePreference(index)"
                size="sm"
              />
              <q-icon
                name="expand_more"
                color="grey-7"
                size="20px"
                :class="['expand-icon', { rotated: expandedIndex === index }]"
              />
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

      <q-btn
        label="Add Dish"
        icon="add"
        color="positive"
        outline
        @click="addPreference"
        class="full-width"
      />
    </div>

    <!-- Submit Button -->
    <div class="submit-section">
      <q-btn
        label="Generate Plan"
        color="positive"
        unelevated
        size="lg"
        @click="handleSubmit"
        :disable="!isValid"
        class="full-width"
      />
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
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}


.preferences-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.section-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.preference-count {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-success-solid);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.preferences-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.preference-card {
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.preference-card:active {
  border-color: var(--color-success-border);
}

.card-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 56px;
}

.card-header:active {
  background: var(--color-bg-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.meal-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-success-solid);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.meal-type-badge {
  padding: var(--space-1) var(--space-3);
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: var(--radius-full);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
}

.meal-type-badge.incomplete {
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  font-style: italic;
}

.attributes-count {
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-xs);
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.expand-icon {
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  padding-top: 0;
}

.submit-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.error-message {
  color: var(--color-error-text);
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  text-align: center;
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
