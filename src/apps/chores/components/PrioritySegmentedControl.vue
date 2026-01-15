<template>
  <div class="priority-segmented" role="radiogroup" aria-label="Priority level">
    <button
      v-for="priority in priorities"
      :key="priority.value"
      :class="[
        'priority-segment',
        { 'priority-segment--active': modelValue === priority.value }
      ]"
      :style="modelValue === priority.value ? {
        backgroundColor: priority.color,
        color: 'white'
      } : {}"
      :aria-checked="modelValue === priority.value"
      role="radio"
      @click="emit('update:modelValue', priority.value)"
      type="button"
    >
      {{ priority.label }}
    </button>
  </div>
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
  { value: ChorePriority.LOW, label: PRIORITY_CONFIGS[ChorePriority.LOW].label, color: PRIORITY_CONFIGS[ChorePriority.LOW].color },
  { value: ChorePriority.MEDIUM, label: PRIORITY_CONFIGS[ChorePriority.MEDIUM].label, color: PRIORITY_CONFIGS[ChorePriority.MEDIUM].color },
  { value: ChorePriority.HIGH, label: PRIORITY_CONFIGS[ChorePriority.HIGH].label, color: PRIORITY_CONFIGS[ChorePriority.HIGH].color }
]
</script>

<style scoped>
.priority-segmented {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  height: 44px;
  background: #fff;
}

.priority-segment {
  flex: 1;
  border: none;
  background: transparent;
  border-right: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0 12px;
}

.priority-segment:last-child {
  border-right: none;
}

.priority-segment:hover {
  background-color: #f9fafb;
}

.priority-segment--active {
  font-weight: 600;
}

.priority-segment:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .priority-segment {
    transition: none !important;
  }
}
</style>
