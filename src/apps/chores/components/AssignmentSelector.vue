<template>
  <div class="assignment-selector">
    <label class="assignment-selector-label">Assign To</label>
    <q-select
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :options="selectOptions"
      option-value="value"
      option-label="label"
      emit-value
      map-options
      outlined
      clearable
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '../types/chores'

interface Props {
  modelValue: number | null
  users: User[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const selectOptions = computed(() => [
  { value: null, label: 'Unassigned' },
  ...props.users.map(user => ({
    value: user.id,
    label: user.username
  }))
])
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
</style>
