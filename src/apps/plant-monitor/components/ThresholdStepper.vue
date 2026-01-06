<template>
  <div class="threshold-stepper">
    <button
      v-haptic:medium
      type="button"
      @touchend.prevent="decrement"
      @click.prevent="decrement"
      class="stepper-button"
      :disabled="modelValue <= min"
      aria-label="Decrease value"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="stepper-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
      </svg>
    </button>

    <div class="value-display">
      <span class="value-number">{{ modelValue }}</span>
      <span class="value-unit">{{ unit }}</span>
    </div>

    <button
      v-haptic:medium
      type="button"
      @touchend.prevent="increment"
      @click.prevent="increment"
      class="stepper-button"
      :disabled="modelValue >= max"
      aria-label="Increase value"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="stepper-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  min: number
  max: number
  step: number
  unit: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function increment() {
  const newValue = Math.min(props.modelValue + props.step, props.max)
  emit('update:modelValue', newValue)
}

function decrement() {
  const newValue = Math.max(props.modelValue - props.step, props.min)
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.threshold-stepper {
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
</style>
