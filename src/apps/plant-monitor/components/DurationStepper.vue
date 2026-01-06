<template>
  <div class="duration-stepper">
    <div class="stepper-row">
      <button
        v-haptic:medium
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
        v-haptic:medium
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
        v-haptic:light
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
  @apply flex flex-col gap-3;
}

.stepper-row {
  @apply flex items-center gap-3;
}

.stepper-button {
  @apply flex items-center justify-center w-14 h-14 rounded-lg
         bg-blue-100 text-blue-700 hover:bg-blue-200
         transition-all duration-200 disabled:opacity-40
         disabled:cursor-not-allowed;
  min-height: 56px;
  min-width: 56px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.stepper-button:active:not(:disabled) {
  transform: scale(0.95);
}

.stepper-icon {
  @apply w-6 h-6;
}

.value-display {
  @apply flex-1 flex items-baseline justify-center gap-2
         px-4 py-3 rounded-lg bg-gray-50 border-2 border-gray-300;
  min-height: 56px;
}

.value-number {
  @apply text-2xl font-bold text-gray-800;
}

.value-unit {
  @apply text-sm text-gray-500 font-medium;
}

.preset-buttons {
  @apply flex gap-2 flex-wrap;
}

.preset-button {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200
         border-2 cursor-pointer;
  min-height: 44px;
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #4b5563;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.preset-button:active {
  transform: scale(0.95);
}

.preset-button:hover {
  background-color: #dbeafe;
  border-color: #93c5fd;
}

.preset-button.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
</style>
