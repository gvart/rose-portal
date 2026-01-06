<template>
  <span class="status-badge" :class="badgeClass">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StatusLevel } from '../types/plant'

const props = defineProps<{ status: StatusLevel }>()

const badgeClass = computed(() => {
  const classes: Record<StatusLevel, string> = {
    good: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    critical: 'bg-red-100 text-red-800',
    saturated: 'bg-blue-100 text-blue-800'
  }
  return classes[props.status]
})

const label = computed(() => {
  const labels: Record<StatusLevel, string> = {
    good: 'Healthy',
    warning: 'Attention Needed',
    critical: 'Critical',
    saturated: 'Well Watered'
  }
  return labels[props.status]
})
</script>

<style scoped>
.status-badge {
  @apply px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide;
}
</style>
