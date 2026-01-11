<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" :class="statusClass">
    <rect x="2" y="6" width="18" height="12" rx="2" stroke-width="2"/>
    <path d="M22 10v4" stroke-width="2" stroke-linecap="round"/>
    <rect v-if="level >= 25" x="4" y="8" width="3" height="8" fill="currentColor" rx="0.5"/>
    <rect v-if="level >= 50" x="8" y="8" width="3" height="8" fill="currentColor" rx="0.5"/>
    <rect v-if="level >= 75" x="12" y="8" width="3" height="8" fill="currentColor" rx="0.5"/>
    <rect v-if="level >= 95" x="16" y="8" width="2" height="8" fill="currentColor" rx="0.5"/>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ level: number }>()

const statusClass = computed(() => {
  if (props.level <= 10) return 'battery-critical'
  if (props.level <= 25) return 'battery-warning'
  return 'battery-good'
})
</script>

<style scoped>
.battery-critical {
  color: var(--color-error-solid);
}

.battery-warning {
  color: var(--color-warning-solid);
}

.battery-good {
  color: var(--color-success-solid);
}
</style>
