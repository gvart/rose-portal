<template>
  <div class="prep-time-input">
    <label class="input-label">Preparation Time (minutes)</label>

    <div class="stepper-container">
      <button @click="decrement" class="stepper-button" :disabled="modelValue <= 1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="stepper-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
        </svg>
      </button>

      <input
        type="number"
        :value="modelValue"
        @input="handleInput"
        min="1"
        max="480"
        class="time-input"
      />

      <button @click="increment" class="stepper-button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="stepper-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>

    <div class="preset-buttons">
      <button
        v-for="preset in presets"
        :key="preset"
        @click="setPreset(preset)"
        :class="['preset-button', { active: modelValue === preset }]"
      >
        {{ preset }} min
      </button>
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

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (!isNaN(value) && value >= 1 && value <= 480) {
    emit('update:modelValue', value)
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: var(--color-success-bg);
  color: var(--color-success-solid);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 56px;
  min-width: 56px;
}

.stepper-button:active:not(:disabled) {
  background: var(--color-success-border);
}

.stepper-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper-icon {
  width: 24px;
  height: 24px;
}

.time-input {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border-primary);
  text-align: center;
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 56px;
}

.time-input:focus {
  outline: none;
  border-color: var(--color-success-solid);
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
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  transition: all var(--duration-fast) var(--ease-in-out);
  border: 2px solid var(--color-border-primary);
  cursor: pointer;
  min-height: 44px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.preset-button:active:not(.active) {
  background-color: var(--color-success-bg);
  border-color: var(--color-success-border);
}

.preset-button.active {
  background-color: var(--color-success-solid);
  border-color: var(--color-success-solid);
  color: white;
}
</style>
