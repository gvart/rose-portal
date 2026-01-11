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
  if (!props.status) return ''

  const classes: Record<StatusLevel, string> = {
    good: 'status-good',
    warning: 'status-warning',
    critical: 'status-critical',
    saturated: 'status-saturated'
  }
  return classes[props.status]
})
</script>

<style scoped>
.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-primary);
}

.status-row:last-child {
  border-bottom: none;
}

.status-row__label {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.status-row__content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.status-row__text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-row__value {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.status-row__value.status-good {
  color: var(--color-success-solid);
}

.status-row__value.status-warning {
  color: var(--color-warning-solid);
}

.status-row__value.status-critical {
  color: var(--color-error-solid);
}

.status-row__value.status-saturated {
  color: var(--color-info-solid);
}

.status-row__detail {
  font-size: var(--font-size-12);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
