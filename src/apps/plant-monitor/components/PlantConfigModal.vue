<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" persistent>
    <q-card class="plant-config-card">
      <q-card-section class="modal-header">
        <div class="text-h5">Plant Configuration</div>
        <q-btn icon="close" flat round dense @click="closeModal" :disable="saveInProgress" />
      </q-card-section>

      <q-card-section class="modal-content">
            <div class="input-section">
              <label class="input-label">Plant Name</label>
              <input
                v-model="localConfig.name"
                type="text"
                class="text-input"
                placeholder="Enter plant name"
                maxlength="50"
                :readonly="!isMobileOrTablet"
                @click="!isMobileOrTablet && (showKeyboard = true)"
                @focus="!isMobileOrTablet && (showKeyboard = true)"
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

            <q-banner v-if="safetyWarnings.length > 0" rounded dense class="bg-warning text-warning q-mb-md">
              <template v-slot:avatar>
                <q-icon name="warning" />
              </template>
              <div
                v-for="(warning, idx) in safetyWarnings"
                :key="idx"
                class="q-mb-xs"
              >
                {{ warning }}
              </div>
            </q-banner>

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
                <q-toggle
                  v-model="localConfig.displayDimEnabled"
                  color="positive"
                  size="lg"
                />
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

            <q-banner v-if="validationErrors.length > 0" rounded dense class="bg-negative text-white q-mb-md">
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              <div
                v-for="(error, idx) in validationErrors"
                :key="idx"
                class="q-mb-xs"
              >
                {{ error.message }}
              </div>
            </q-banner>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn label="Cancel" flat @click="closeModal" :disable="saveInProgress" />
        <q-btn
          label="Save Configuration"
          color="primary"
          unelevated
          :disable="!isValid || saveInProgress"
          :loading="saveInProgress"
          @click="saveConfig"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

    <!-- Floating Keyboard (Desktop only) -->
    <FloatingKeyboard
      v-if="!isMobileOrTablet"
      v-model="localConfig.name"
      v-model:show="showKeyboard"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
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

const { isMobileOrTablet } = useDeviceDetection()

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
.plant-config-card {
  max-width: 672px;
  width: 100%;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-content {
  overflow-y: auto;
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
</style>
