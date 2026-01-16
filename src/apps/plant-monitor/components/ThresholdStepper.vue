<template>
  <div class="threshold-stepper">
    <q-btn
      icon="remove"
      color="info"
      unelevated
      @click="decrement"
      :disable="modelValue <= min"
      aria-label="Decrease value"
      class="stepper-button"
    />

    <div class="value-display">
      <span class="value-number">{{ modelValue }}</span>
      <span class="value-unit">{{ unit }}</span>
    </div>

    <q-btn
      icon="add"
      color="info"
      unelevated
      @click="increment"
      :disable="modelValue >= max"
      aria-label="Increase value"
      class="stepper-button"
    />
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
</style>
