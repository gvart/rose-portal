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

            <div class="input-section">
              <div class="toggle-row">
                <div class="toggle-label-group">
                  <label class="input-label">Display Dim</label>
                  <p class="input-hint">
                    Automatically dim the display after inactivity.
                  </p>
                </div>
                <button
                  v-haptic:light
                  type="button"
                  @click="localConfig.displayDimEnabled = !localConfig.displayDimEnabled"
                  :class="['toggle-button', { active: localConfig.displayDimEnabled }]"
                  role="switch"
                  :aria-checked="localConfig.displayDimEnabled"
                >
                  <span class="toggle-slider"></span>
                </button>
              </div>
            </div>

            <div v-if="localConfig.displayDimEnabled" class="input-section">
              <label class="input-label">Display Dim Timeout</label>
              <DurationStepper
                v-model="localConfig.displayDimTimeout"
                :min="CONFIG_LIMITS.displayDimTimeout.min"
                :max="CONFIG_LIMITS.displayDimTimeout.max"
                :step="CONFIG_LIMITS.displayDimTimeout.step"
                unit="auto"
                :presets="[10, 30, 60, 120]"
              />
              <p class="input-hint">
                How long to wait before dimming the display.
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
  publishInterval: 0,
  displayDimEnabled: false,
  displayDimTimeout: 0
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
        publishInterval: plant.config.publishInterval,
        displayDimEnabled: plant.config.displayDimEnabled,
        displayDimTimeout: plant.config.displayDimTimeout
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
      publishInterval: localConfig.value.publishInterval,
      displayDimEnabled: localConfig.value.displayDimEnabled,
      displayDimTimeout: localConfig.value.displayDimTimeout
    })
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 50;
}

.modal-container {
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  border-radius: var(--radius-lg);
  max-width: 672px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: var(--depth-2-border);
}

.modal-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--space-11);
  min-height: var(--space-11);
  border-radius: var(--radius-sm);
  color: var(--color-text-faint);
  background: transparent;
  border: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.close-button:active {
  transform: scale(0.96);
  background: var(--color-bg-active);
  color: var(--color-text-secondary);
}

.modal-content {
  overflow-y: auto;
  padding: var(--space-6);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.label-hint {
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-muted);
  margin-left: var(--space-2);
}

.input-hint {
  font-size: var(--font-size-11);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.text-input {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  border: var(--depth-1-border);
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  min-height: var(--space-11);
  caret-color: transparent;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.validation-errors {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-error-bg);
  border: 2px solid var(--color-error-border);
  border-radius: var(--radius-sm);
}

.error-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-error-text);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
}

.safety-warnings {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-warning-bg);
  border: 2px solid var(--color-warning-border);
  border-radius: var(--radius-sm);
}

.warning-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--color-warning-text);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
}

.warning-item svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: var(--depth-2-border);
}

.btn {
  flex: 1;
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border-radius: var(--radius-md);
  border: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  min-height: var(--space-11);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:active:not(:disabled) {
  transform: scale(0.96);
}

.btn-secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.btn-secondary:active:not(:disabled) {
  background: var(--color-bg-active);
}

.btn-primary {
  background: var(--color-accent-primary);
  color: white;
}

.btn-primary:active:not(:disabled) {
  background: var(--color-accent-primary-active);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.96) translateY(var(--space-4));
  opacity: 0;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.toggle-label-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.toggle-button {
  position: relative;
  width: 52px;
  height: 32px;
  background: var(--color-bg-tertiary);
  border: var(--depth-1-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.toggle-button:active {
  transform: scale(0.96);
}

.toggle-button.active {
  background: var(--color-success-solid);
  border-color: var(--color-success-solid);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  background: var(--color-bg-primary);
  border-radius: var(--radius-full);
  transition: transform var(--duration-fast) var(--ease-in-out);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-button.active .toggle-slider {
  transform: translateX(20px);
}
</style>
