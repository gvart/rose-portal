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
  @apply flex flex-col gap-3;
}

.input-label {
  @apply text-base font-semibold text-gray-700;
}

.stepper-container {
  @apply flex items-center gap-3;
}

.stepper-button {
  @apply flex items-center justify-center w-14 h-14 rounded-lg
         bg-emerald-100 text-emerald-700 hover:bg-emerald-200
         transition-all duration-200 disabled:opacity-40
         disabled:cursor-not-allowed;
  min-height: 56px;
  min-width: 56px;
}

.stepper-icon {
  @apply w-6 h-6;
}

.time-input {
  @apply flex-1 px-4 py-3 rounded-lg border-2 border-gray-300
         text-center text-xl font-semibold text-gray-800
         focus:outline-none focus:border-emerald-500
         transition-all duration-200;
  min-height: 56px;
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
}

.preset-button:hover {
  background-color: #d1fae5;
  border-color: #6ee7b7;
}

.preset-button.active {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}
</style>
