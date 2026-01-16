<template>
  <q-btn-toggle
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    :options="priorities"
    spread
    unelevated
    :toggle-color="getToggleColor(modelValue)"
    color="grey-3"
    text-color="grey-9"
    class="priority-segmented"
  />
</template>

<script setup lang="ts">
import { ChorePriority, PRIORITY_CONFIGS } from '../types/chores'

interface Props {
  modelValue: ChorePriority
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: ChorePriority]
}>()

const priorities = [
  { value: ChorePriority.LOW, label: PRIORITY_CONFIGS[ChorePriority.LOW].label },
  { value: ChorePriority.MEDIUM, label: PRIORITY_CONFIGS[ChorePriority.MEDIUM].label },
  { value: ChorePriority.HIGH, label: PRIORITY_CONFIGS[ChorePriority.HIGH].label }
]

function getToggleColor(priority: ChorePriority): string {
  // Map priority to Quasar color names
  const colorMap: Record<ChorePriority, string> = {
    [ChorePriority.LOW]: 'grey-7',
    [ChorePriority.MEDIUM]: 'warning',
    [ChorePriority.HIGH]: 'negative'
  }
  return colorMap[priority]
}
</script>

<style scoped>
.priority-segmented {
  height: 44px;
}
</style>
