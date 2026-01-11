<template>
  <div class="gauge-card" :class="`gauge-card--${status}`">
    <div class="gauge-card__header">
      <slot name="icon" />
      <h3 class="gauge-card__title">{{ title }}</h3>
    </div>

    <div
      class="gauge-card__visual"
      role="progressbar"
      :aria-label="`${title}: ${value} ${unit}`"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="max"
    >
      <svg class="gauge-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          class="gauge-ring__bg"
        />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          class="gauge-ring__fill"
          :class="`gauge-ring__fill--${status}`"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div class="gauge-card__value">
        <span class="gauge-card__number">{{ value }}</span>
        <span class="gauge-card__unit">{{ unit }}</span>
      </div>
    </div>

    <p class="gauge-card__subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StatusLevel } from '../types/plant'

const props = defineProps<{
  title: string
  value: number
  max: number
  unit: string
  status: StatusLevel
  subtitle: string
}>()

const circumference = 2 * Math.PI * 42
const offset = computed(() => {
  const progress = props.value / props.max
  return circumference * (1 - progress)
})
</script>

<style scoped>
.gauge-card {
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  text-align: center;
  border-left: 4px solid var(--color-success-solid);
}

.gauge-card--warning {
  border-left-color: var(--color-warning-solid);
}

.gauge-card--critical {
  border-left-color: var(--color-error-solid);
}

.gauge-card--saturated {
  border-left-color: var(--color-info-solid);
}

.gauge-card__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.gauge-card__header :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--color-text-secondary);
}

.gauge-card__title {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.gauge-card__visual {
  position: relative;
  width: 128px;
  height: 128px;
  margin: 0 auto var(--space-4);
}

.gauge-ring {
  width: 100%;
  height: 100%;
}

.gauge-ring__bg {
  color: var(--color-border-secondary);
}

.gauge-ring__fill {
  color: var(--color-success-solid);
  transition: all 700ms var(--ease-in-out);
}

.gauge-ring__fill--warning {
  color: var(--color-warning-solid);
}

.gauge-ring__fill--critical {
  color: var(--color-error-solid);
}

.gauge-ring__fill--saturated {
  color: var(--color-info-solid);
}

.gauge-card__value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-card__number {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.gauge-card__unit {
  font-size: var(--font-size-16);
  color: var(--color-text-muted);
  margin-left: 2px;
}

.gauge-card__subtitle {
  font-size: var(--font-size-13);
  color: var(--color-text-secondary);
}
</style>
