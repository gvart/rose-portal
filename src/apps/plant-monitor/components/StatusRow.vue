<template>
  <div class="status-row">
    <div class="status-row__label">{{ label }}</div>
    <div class="status-row__content">
      <slot name="visual" />
      <div class="status-row__text">
        <span class="status-row__value" :class="valueClass">{{ value }}</span>
        <span v-if="detail" class="status-row__detail">{{ detail }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StatusLevel } from '../types/plant'

const props = defineProps<{
  label: string
  value: string
  detail?: string
  status?: StatusLevel
}>()

const valueClass = computed(() => {
  if (!props.status) return 'text-gray-800'

  const classes: Record<StatusLevel, string> = {
    good: 'text-green-600',
    warning: 'text-amber-600',
    critical: 'text-red-600',
    saturated: 'text-blue-600'
  }
  return classes[props.status]
})
</script>

<style scoped>
.status-row {
  @apply flex justify-between items-center py-2 border-b border-gray-100 last:border-0;
}

.status-row__label {
  @apply text-sm font-medium text-gray-600;
}

.status-row__content {
  @apply flex items-center gap-2;
}

.status-row__text {
  @apply flex flex-col items-end;
}

.status-row__value {
  @apply text-sm font-semibold;
}

.status-row__detail {
  @apply text-xs text-gray-500;
}
</style>
