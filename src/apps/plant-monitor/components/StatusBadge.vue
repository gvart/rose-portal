<template>
  <q-badge
    :color="badgeColor"
    :text-color="textColor"
    :label="label"
    class="status-badge"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StatusLevel } from '../types/plant'

const props = defineProps<{ status: StatusLevel }>()

const badgeColor = computed(() => {
  const colors: Record<StatusLevel, string> = {
    good: 'positive',
    warning: 'warning',
    critical: 'negative',
    saturated: 'info'
  }
  return colors[props.status]
})

const textColor = computed(() => {
  // Use appropriate text colors for each status
  const textColors: Record<StatusLevel, string> = {
    good: 'white',
    warning: 'white',
    critical: 'white',
    saturated: 'white'
  }
  return textColors[props.status]
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
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 12px;
  border-radius: 9999px;
}
</style>
