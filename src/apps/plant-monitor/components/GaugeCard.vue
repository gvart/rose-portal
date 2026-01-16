<template>
  <q-card class="gauge-card" :class="`gauge-card--${status}`">
    <q-card-section class="text-center">
      <div class="gauge-card__header">
        <slot name="icon" />
        <h3 class="gauge-card__title">{{ title }}</h3>
      </div>

      <div class="gauge-card__visual">
        <q-circular-progress
          :value="progressValue"
          :color="progressColor"
          size="128px"
          :thickness="0.12"
          track-color="grey-3"
          class="gauge-ring"
        >
          <div class="gauge-card__value">
            <span class="gauge-card__number">{{ value }}</span>
            <span class="gauge-card__unit">{{ unit }}</span>
          </div>
        </q-circular-progress>
      </div>

      <p class="gauge-card__subtitle">{{ subtitle }}</p>
    </q-card-section>
  </q-card>
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

const progressValue = computed(() => (props.value / props.max) * 100)

const progressColor = computed(() => {
  const colorMap: Record<StatusLevel, string> = {
    good: 'positive',
    warning: 'warning',
    critical: 'negative',
    saturated: 'info'
  }
  return colorMap[props.status]
})
</script>

<style scoped>
.gauge-card {
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
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-4);
}

.gauge-card__value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
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
