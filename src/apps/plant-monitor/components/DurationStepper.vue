<template>
  <div class="duration-stepper">
    <div class="stepper-row">
      <q-btn
        icon="remove"
        color="info"
        unelevated
        @click="decrement"
        :disable="modelValue <= min"
        aria-label="Decrease duration"
        class="stepper-button"
      />

      <div class="value-display">
        <span class="value-number">{{ displayValue }}</span>
        <span class="value-unit">{{ displayUnit }}</span>
      </div>

      <q-btn
        icon="add"
        color="info"
        unelevated
        @click="increment"
        :disable="modelValue >= max"
        aria-label="Increase duration"
        class="stepper-button"
      />
    </div>

    <div v-if="presets && presets.length > 0" class="preset-buttons">
      <q-chip
        v-for="preset in presets"
        :key="preset"
        :label="formatPreset(preset)"
        clickable
        :color="isPresetActive(preset) ? 'info' : undefined"
        :outline="!isPresetActive(preset)"
        @click="setPreset(preset)"
        class="preset-chip"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  min: number
  max: number
  step: number
  unit: 'seconds' | 'minutes' | 'auto'
  presets?: number[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed(() => {
  const ms = props.modelValue

  if (props.unit === 'auto') {
    if (ms >= 60000) {
      return (ms / 60000).toFixed(ms % 60000 === 0 ? 0 : 1)
    }
    return (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)
  }

  if (props.unit === 'minutes') {
    return (ms / 60000).toFixed(ms % 60000 === 0 ? 0 : 1)
  }

  return (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1)
})

const displayUnit = computed(() => {
  const ms = props.modelValue

  if (props.unit === 'auto') {
    return ms >= 60000 ? 'min' : 'sec'
  }

  return props.unit === 'minutes' ? 'min' : 'sec'
})

function increment() {
  const newValue = Math.min(props.modelValue + props.step, props.max)
  emit('update:modelValue', newValue)
}

function decrement() {
  const newValue = Math.max(props.modelValue - props.step, props.min)
  emit('update:modelValue', newValue)
}

function setPreset(seconds: number) {
  const ms = seconds * 1000
  const clamped = Math.max(props.min, Math.min(ms, props.max))
  emit('update:modelValue', clamped)
}

function isPresetActive(seconds: number) {
  return props.modelValue === seconds * 1000
}

function formatPreset(seconds: number) {
  if (seconds >= 60) {
    const mins = seconds / 60
    return `${mins}min`
  }
  return `${seconds}s`
}
</script>

<style scoped>
.duration-stepper {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stepper-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stepper-button {
  min-height: 56px;
  min-width: 56px;
}

.value-display {
  flex: 1;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-secondary);
  min-height: 56px;
}

.value-number {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.value-unit {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.preset-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
</style>
