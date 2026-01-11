<template>
  <div class="assignment-selector">
    <label class="assignment-selector-label">Assign To</label>
    <select
      :value="modelValue ?? ''"
      class="assignment-selector-input"
      @change="handleChange"
    >
      <option value="">Unassigned</option>
      <option v-for="user in users" :key="user.id" :value="user.id">
        {{ user.username }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import type { User } from '../types/chores'

interface Props {
  modelValue: number | null
  users: User[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

function handleChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? null : parseInt(target.value, 10)
  emit('update:modelValue', value)
}
</script>

<style scoped>
.assignment-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.assignment-selector-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.assignment-selector-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
}

.assignment-selector-input:hover {
  border-color: #9ca3af;
}

.assignment-selector-input:focus {
  outline: none;
  border-color: #EC4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.assignment-selector-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}
</style>
