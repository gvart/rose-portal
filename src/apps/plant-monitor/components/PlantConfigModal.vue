<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Plant Configuration</h2>
            <button
              v-haptic:light
              type="button"
              @touchend.prevent="closeModal"
              @click.prevent="closeModal"
              class="close-button"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="modal-content">
            <div class="input-section">
              <label class="input-label">Plant Name</label>
              <input
                v-model="localConfig.name"
                type="text"
                class="text-input"
                placeholder="Enter plant name"
                maxlength="50"
                readonly
                @click="showKeyboard = true"
                @focus="showKeyboard = true"
              />
            </div>

            <div class="input-section">
              <label class="input-label">
                Dry Threshold
                <span class="label-hint">(triggers watering)</span>
              </label>
              <ThresholdStepper
                v-model="localConfig.dryThreshold"
                :min="CONFIG_LIMITS.dryThreshold.min"
                :max="CONFIG_LIMITS.dryThreshold.max"
                :step="CONFIG_LIMITS.dryThreshold.step"
                unit="%"
              />
              <p class="input-hint">
                Device waters when moisture drops below this percentage.
              </p>
            </div>

            <div class="input-section">
              <label class="input-label">
                Wet Threshold
                <span class="label-hint">(stops watering)</span>
              </label>
              <ThresholdStepper
                v-model="localConfig.wetThreshold"
                :min="CONFIG_LIMITS.wetThreshold.min"
                :max="CONFIG_LIMITS.wetThreshold.max"
                :step="CONFIG_LIMITS.wetThreshold.step"
                unit="%"
              />
              <p class="input-hint">
                Device stops watering when moisture reaches this level.
              </p>
            </div>

            <div v-if="safetyWarnings.length > 0" class="safety-warnings">
              <div
                v-for="(warning, idx) in safetyWarnings"
                :key="idx"
                class="warning-item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ warning }}</span>
              </div>
            </div>

            <div class="input-section">
              <label class="input-label">Pump Duration</label>
              <DurationStepper
                v-model="localConfig.pumpDuration"
                :min="CONFIG_LIMITS.pumpDuration.min"
                :max="CONFIG_LIMITS.pumpDuration.max"
                :step="CONFIG_LIMITS.pumpDuration.step"
                unit="seconds"
                :presets="[1, 2, 3, 5]"
              />
              <p class="input-hint">
                How long the pump runs during each watering cycle.
              </p>
            </div>

            <div class="input-section">
              <label class="input-label">Data Update Interval</label>
              <DurationStepper
                v-model="localConfig.publishInterval"
                :min="CONFIG_LIMITS.publishInterval.min"
                :max="CONFIG_LIMITS.publishInterval.max"
                :step="CONFIG_LIMITS.publishInterval.step"
                unit="auto"
                :presets="[30, 60, 300, 600]"
              />
              <p class="input-hint">
                How often the device sends sensor data updates.
              </p>
            </div>

            <div v-if="validationErrors.length > 0" class="validation-errors">
              <div
                v-for="(error, idx) in validationErrors"
                :key="idx"
                class="error-item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ error.message }}</span>
              </div>
            </div>

            <div class="action-buttons">
              <button
                v-haptic:light
                type="button"
                @touchend.prevent="closeModal"
                @click.prevent="closeModal"
                class="btn btn-secondary"
                :disabled="saveInProgress"
              >
                Cancel
              </button>
              <button
                v-haptic:medium
                type="button"
                @touchend.prevent="saveConfig"
                @click.prevent="saveConfig"
                class="btn btn-primary"
                :disabled="!isValid || saveInProgress"
              >
                {{ saveInProgress ? 'Saving...' : 'Save Configuration' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Floating Keyboard -->
    <FloatingKeyboard
      v-model="localConfig.name"
      v-model:show="showKeyboard"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Plant, PlantConfig, ConfigValidationError } from '../types/plant'
import { CONFIG_LIMITS, SAFE_THRESHOLD_RANGE, rawToPercentage, percentageToRaw } from '../types/plant'
import ThresholdStepper from './ThresholdStepper.vue'
import DurationStepper from './DurationStepper.vue'
import FloatingKeyboard from '@/components/common/FloatingKeyboard.vue'

interface Props {
  modelValue: boolean
  plant: Plant
  saveInProgress: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [config: PlantConfig & { name: string }]
}>()

const localConfig = ref({
  name: '',
  dryThreshold: 0,
  wetThreshold: 0,
  pumpDuration: 0,
  publishInterval: 0
})

const showKeyboard = ref(false)

watch(
  () => props.plant,
  (plant) => {
    if (plant) {
      localConfig.value = {
        name: plant.name,
        dryThreshold: rawToPercentage(plant.config.dryThreshold),
        wetThreshold: rawToPercentage(plant.config.wetThreshold),
        pumpDuration: plant.config.pumpDuration,
        publishInterval: plant.config.publishInterval
      }
    }
  },
  { immediate: true }
)

const safetyWarnings = computed<string[]>(() => {
  const warnings: string[] = []

  if (localConfig.value.dryThreshold < SAFE_THRESHOLD_RANGE.MIN) {
    warnings.push(
      `⚠️ Dry threshold is very low (${localConfig.value.dryThreshold}%). Your plant might die from insufficient water! Recommended: ${SAFE_THRESHOLD_RANGE.MIN}% or higher.`
    )
  }

  if (localConfig.value.dryThreshold > SAFE_THRESHOLD_RANGE.MAX) {
    warnings.push(
      `Dry threshold is very high (${localConfig.value.dryThreshold}%). Plants may become too dry before watering. Recommended: ${SAFE_THRESHOLD_RANGE.MAX}% or lower.`
    )
  }

  if (localConfig.value.wetThreshold < SAFE_THRESHOLD_RANGE.MIN) {
    warnings.push(
      `Wet threshold is very low (${localConfig.value.wetThreshold}%). This may not provide enough water. Recommended: ${SAFE_THRESHOLD_RANGE.MIN}% or higher.`
    )
  }

  if (localConfig.value.wetThreshold > SAFE_THRESHOLD_RANGE.MAX) {
    warnings.push(
      `Wet threshold is very high (${localConfig.value.wetThreshold}%). This may cause over-watering and root rot. Recommended: ${SAFE_THRESHOLD_RANGE.MAX}% or lower.`
    )
  }

  return warnings
})

const validationErrors = computed<ConfigValidationError[]>(() => {
  const errors: ConfigValidationError[] = []

  if (!localConfig.value.name || localConfig.value.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Plant name is required' })
  }

  if (localConfig.value.dryThreshold >= localConfig.value.wetThreshold) {
    errors.push({
      field: 'thresholds',
      message: 'Dry threshold must be lower than wet threshold (in moisture %)'
    })
  }

  if (localConfig.value.pumpDuration < CONFIG_LIMITS.pumpDuration.min) {
    errors.push({
      field: 'pumpDuration',
      message: `Pump duration must be at least ${CONFIG_LIMITS.pumpDuration.min}ms`
    })
  }

  if (localConfig.value.publishInterval < CONFIG_LIMITS.publishInterval.min) {
    errors.push({
      field: 'publishInterval',
      message: `Publish interval must be at least ${CONFIG_LIMITS.publishInterval.min / 1000}s`
    })
  }

  return errors
})

const isValid = computed(() => validationErrors.value.length === 0)

function closeModal() {
  if (!props.saveInProgress) {
    emit('update:modelValue', false)
  }
}

function saveConfig() {
  if (isValid.value) {
    // Convert percentages back to raw sensor values for backend
    emit('save', {
      name: localConfig.value.name,
      dryThreshold: percentageToRaw(localConfig.value.dryThreshold),
      wetThreshold: percentageToRaw(localConfig.value.wetThreshold),
      pumpDuration: localConfig.value.pumpDuration,
      publishInterval: localConfig.value.publishInterval
    })
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-container {
  @apply bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b-2 border-gray-200;
}

.modal-title {
  @apply text-2xl font-bold text-gray-800;
}

.close-button {
  @apply flex items-center justify-center w-10 h-10 rounded-lg
         text-gray-500 hover:bg-gray-100 hover:text-gray-700
         transition-all duration-200;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.close-button:active {
  transform: scale(0.95);
}

.modal-content {
  @apply overflow-y-auto p-6 flex-1 space-y-6;
}

.input-section {
  @apply flex flex-col gap-2;
}

.input-label {
  @apply text-base font-semibold text-gray-700;
}

.label-hint {
  @apply text-sm font-normal text-gray-500 ml-2;
}

.input-hint {
  @apply text-xs text-gray-500 mt-1;
}

.text-input {
  @apply px-4 py-3 rounded-lg border-2 border-gray-300
         text-lg text-gray-800 focus:outline-none
         focus:border-blue-500 transition-all duration-200 cursor-pointer;
  min-height: 52px;
  caret-color: transparent;
}

.text-input:focus {
  @apply border-blue-500 bg-blue-50;
}

.validation-errors {
  @apply flex flex-col gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg;
}

.error-item {
  @apply flex items-center gap-2 text-red-700 text-sm font-medium;
}

.safety-warnings {
  @apply flex flex-col gap-2 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg;
}

.warning-item {
  @apply flex items-start gap-2 text-amber-800 text-sm font-medium;
}

.warning-item svg {
  @apply flex-shrink-0 mt-0.5;
}

.action-buttons {
  @apply flex gap-3 pt-4 border-t-2 border-gray-200;
}

.btn {
  @apply flex-1 py-3 px-6 font-semibold rounded-lg
         transition-all duration-200 disabled:opacity-50
         disabled:cursor-not-allowed;
  min-height: 52px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.btn:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
