<template>
  <div class="threshold-stepper">
    <button
     
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
</style>
