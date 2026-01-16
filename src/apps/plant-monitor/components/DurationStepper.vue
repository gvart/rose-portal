<template>
  <div class="duration-stepper">
    <div class="stepper-row">
      <button
       
        type="button"
        @touchend.prevent="decrement"
        @click.prevent="decrement"
        class="stepper-button"
        :disabled="modelValue <= min"
        aria-label="Decrease duration"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="stepper-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
        </svg>
      </button>

      <div class="value-display">
        <span class="value-number">{{ displayValue }}</span>
        <span class="value-unit">{{ displayUnit }}</span>
      </div>

      <button
       
        type="button"
        @touchend.prevent="increment"
        @click.prevent="increment"
        class="stepper-button"
        :disabled="modelValue >= max"
        aria-label="Increase duration"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="stepper-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>

    <div v-if="presets && presets.length > 0" class="preset-buttons">
      <button
        v-for="preset in presets"
        :key="preset"
       
        type="button"
        @touchend.prevent="setPreset(preset)"
        @click.prevent="setPreset(preset)"
        :class="['preset-button', { active: isPresetActive(preset) }]"
      >
        {{ formatPreset(preset) }}
      </button>
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--color-info-bg);
  color: var(--color-info-solid);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 56px;
  min-width: 56px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.stepper-button:active:not(:disabled) {
  transform: scale(0.95);
  background: #bfdbfe;
}

.stepper-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper-icon {
  width: 24px;
  height: 24px;
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

.preset-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-in-out);
  border: 2px solid var(--color-border-secondary);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  min-height: 44px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.preset-button:active {
  transform: scale(0.95);
}

.preset-button.active {
  background-color: var(--color-info-solid);
  border-color: var(--color-info-solid);
  color: white;
}
</style>
