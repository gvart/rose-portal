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
    good: 'badge-good',
    warning: 'badge-warning',
    critical: 'badge-critical',
    saturated: 'badge-saturated'
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
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-good {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.badge-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.badge-critical {
  background: var(--color-error-bg);
  color: var(--color-error-text);
}

.badge-saturated {
  background: var(--color-info-bg);
  color: var(--color-info-text);
}
</style>
