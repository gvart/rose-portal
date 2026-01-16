<template>
  <div class="prep-time-input">
    <label class="input-label">Preparation Time (minutes)</label>

    <div class="stepper-container">
      <q-btn
        icon="remove"
        color="positive"
        unelevated
        @click="decrement"
        :disable="modelValue <= 1"
        class="stepper-button"
      />

      <q-input
        :model-value="modelValue"
        type="number"
        min="1"
        max="480"
        outlined
        input-class="text-center text-weight-semibold"
        input-style="font-family: var(--font-mono); font-variant-numeric: tabular-nums;"
        @update:model-value="handleInput"
        class="time-input"
      />

      <q-btn
        icon="add"
        color="positive"
        unelevated
        @click="increment"
        class="stepper-button"
      />
    </div>

    <div class="preset-buttons">
      <q-chip
        v-for="preset in presets"
        :key="preset"
        :label="`${preset} min`"
        clickable
        :color="modelValue === preset ? 'positive' : undefined"
        :outline="modelValue !== preset"
        @click="setPreset(preset)"
        class="preset-chip"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const presets = [15, 30, 45, 60]

function increment() {
  emit('update:modelValue', Math.min(props.modelValue + 5, 480))
}

function decrement() {
  emit('update:modelValue', Math.max(props.modelValue - 5, 1))
}

function handleInput(value: number | string | null) {
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value
  if (numValue && !isNaN(numValue) && numValue >= 1 && numValue <= 480) {
    emit('update:modelValue', numValue)
  }
}

function setPreset(value: number) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.prep-time-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.input-label {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.stepper-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stepper-button {
  min-height: 56px;
  min-width: 56px;
}

.time-input {
  flex: 1;
}

.preset-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.preset-chip {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
