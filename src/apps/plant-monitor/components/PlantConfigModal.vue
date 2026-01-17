<template>
  <PwaModal
    :model-value="modelValue"
    @update:model-value="val => $emit('update:modelValue', val)"
    :show-submit="true"
    :can-submit="isValid"
    :loading="saveInProgress"
    @submit="saveConfig"
    @close="closeModal"
  >
    <template #title>
      <div>
        <div>Plant Configuration</div>
        <div class="text-caption text-grey-7">{{ plant?.name || 'Configure plant settings' }}</div>
      </div>
    </template>

    <div class="form-grid">
      <!-- Plant Name - Full Width -->
      <div class="input-section full-width">
        <label class="input-label">Plant Name</label>
        <input
          v-model="localConfig.name"
          type="text"
          class="text-input"
          placeholder="Enter plant name"
          maxlength="50"
          :readonly="isPi5"
          @click="isPi5 && (showKeyboard = true)"
          @focus="isPi5 && (showKeyboard = true)"
        />
      </div>

      <!-- Dry Threshold -->
      <div class="input-section">
        <label class="input-label">
          Dry Threshold
          <span class="form-label--secondary">(triggers watering)</span>
        </label>
        <ThresholdStepper
          v-model="localConfig.dryThreshold"
          :min="CONFIG_LIMITS.dryThreshold.min"
          :max="CONFIG_LIMITS.dryThreshold.max"
          :step="CONFIG_LIMITS.dryThreshold.step"
          unit="%"
          dense
        />
        <p class="form-hint">
          Waters when moisture drops below this %.
        </p>
      </div>

      <!-- Wet Threshold -->
      <div class="input-section">
        <label class="input-label">
          Wet Threshold
          <span class="form-label--secondary">(stops watering)</span>
        </label>
        <ThresholdStepper
          v-model="localConfig.wetThreshold"
          :min="CONFIG_LIMITS.wetThreshold.min"
          :max="CONFIG_LIMITS.wetThreshold.max"
          :step="CONFIG_LIMITS.wetThreshold.step"
          unit="%"
          dense
        />
        <p class="form-hint">
          Stops watering at this moisture level.
        </p>
      </div>

      <!-- Safety Warnings - Full Width -->
      <q-banner v-if="safetyWarnings.length > 0" rounded dense class="bg-warning text-warning full-width">
        <template v-slot:avatar>
          <q-icon name="warning" />
        </template>
        <div v-for="(warning, idx) in safetyWarnings" :key="idx" class="q-mb-xs">
          {{ warning }}
        </div>
      </q-banner>

      <!-- Pump Duration -->
      <div class="input-section">
        <label class="input-label">Pump Duration</label>
        <DurationStepper
          v-model="localConfig.pumpDuration"
          :min="CONFIG_LIMITS.pumpDuration.min"
          :max="CONFIG_LIMITS.pumpDuration.max"
          :step="CONFIG_LIMITS.pumpDuration.step"
          unit="seconds"
          :presets="[1, 2, 3, 5]"
          dense
        />
        <p class="form-hint">
          Duration per watering cycle.
        </p>
      </div>

      <!-- Update Interval -->
      <div class="input-section">
        <label class="input-label">Update Interval</label>
        <DurationStepper
          v-model="localConfig.publishInterval"
          :min="CONFIG_LIMITS.publishInterval.min"
          :max="CONFIG_LIMITS.publishInterval.max"
          :step="CONFIG_LIMITS.publishInterval.step"
          unit="auto"
          :presets="[30, 60, 300, 600]"
          dense
        />
        <p class="form-hint">
          How often data is published.
        </p>
      </div>

      <!-- Display Dim Toggle - Full Width -->
      <div class="input-section full-width">
        <div class="toggle-row">
          <div class="toggle-label-group">
            <label class="input-label">Display Dim</label>
            <p class="form-hint">
              Auto-dim display after inactivity.
            </p>
          </div>
          <q-toggle
            v-model="localConfig.displayDimEnabled"
            color="positive"
          />
        </div>
      </div>

      <!-- Dim Timeout - Full Width -->
      <div v-if="localConfig.displayDimEnabled" class="input-section full-width">
        <label class="input-label">Dim Timeout</label>
        <DurationStepper
          v-model="localConfig.displayDimTimeout"
          :min="CONFIG_LIMITS.displayDimTimeout.min"
          :max="CONFIG_LIMITS.displayDimTimeout.max"
          :step="CONFIG_LIMITS.displayDimTimeout.step"
          unit="auto"
          :presets="[10, 30, 60, 120]"
          dense
        />
      </div>

      <!-- Validation Errors - Full Width -->
      <q-banner v-if="validationErrors.length > 0" rounded dense class="bg-negative text-white full-width">
        <template v-slot:avatar>
          <q-icon name="error" />
        </template>
        <div v-for="(error, idx) in validationErrors" :key="idx" class="q-mb-xs">
          {{ error.message }}
        </div>
      </q-banner>
    </div>
  </PwaModal>

  <!-- On-Screen Keyboard (Pi5 only) -->
  <Teleport to="body">
    <FloatingKeyboard
      v-if="isPi5"
      v-model="localConfig.name"
      v-model:show="showKeyboard"
      :docked="true"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import type { Plant, PlantConfig, ConfigValidationError } from '../types/plant'
import { CONFIG_LIMITS, SAFE_THRESHOLD_RANGE, rawToPercentage, percentageToRaw } from '../types/plant'
import PwaModal from '@/components/common/PwaModal.vue'
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

const { isPi5 } = useDeviceDetection()

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
      `Dry threshold is very low (${localConfig.value.dryThreshold}%). Your plant might die from insufficient water! Recommended: ${SAFE_THRESHOLD_RANGE.MIN}% or higher.`
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

/* Responsive grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.full-width {
  grid-column: 1 / -1;
}

/* Mobile-specific optimizations for phones */
@media (max-width: 768px) {
  /* Tighter form grid */
  .form-grid {
    gap: 12px !important;
  }

  /* Reduce input section gaps */
  .input-section {
    gap: 4px !important;
  }

  /* Compact hint text */
  .form-hint {
    font-size: 12px !important;
    margin-top: 2px !important;
    line-height: 1.3;
  }

  /* Compact warning banners */
  .q-banner {
    padding: 8px !important;
    font-size: 12px !important;
  }

  /* Reduce toggle row spacing */
  .toggle-row {
    gap: 8px !important;
  }
}

/* Ultra-compact mode optimizations for Pi5 */
@media (max-height: 768px) {
  /* Make form grid more horizontal on landscape */
  .form-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  /* Keep plant name full width */
  .input-section.full-width {
    grid-column: 1 / -1;
  }

  /* Hide less critical hint text to save vertical space */
  .form-hint {
    display: none;
  }

  /* Compact warning banners */
  .q-banner {
    padding: 6px 8px !important;
    font-size: 10px !important;
  }
}
</style>
