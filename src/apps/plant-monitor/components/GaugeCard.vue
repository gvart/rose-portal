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
          stroke-linecap="round"
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
  @apply bg-white rounded-xl shadow-md p-6 text-center;
  border-left: 4px solid #22C55E;
}

.gauge-card--warning {
  border-left-color: #F59E0B;
}

.gauge-card--critical {
  border-left-color: #EF4444;
}

.gauge-card--saturated {
  border-left-color: #3B82F6;
}

.gauge-card__header {
  @apply flex items-center justify-center gap-2 mb-4;
}

.gauge-card__header :deep(svg) {
  @apply w-6 h-6 text-gray-600;
}

.gauge-card__title {
  @apply text-lg font-semibold text-gray-800;
}

.gauge-card__visual {
  @apply relative w-32 h-32 mx-auto mb-4;
}

.gauge-ring {
  @apply w-full h-full;
}

.gauge-ring__bg {
  @apply text-gray-200;
}

.gauge-ring__fill {
  @apply text-green-500 transition-all duration-700;
}

.gauge-ring__fill--warning {
  @apply text-amber-500;
}

.gauge-ring__fill--critical {
  @apply text-red-500;
}

.gauge-ring__fill--saturated {
  @apply text-blue-500;
}

.gauge-card__value {
  @apply absolute inset-0 flex items-center justify-center;
}

.gauge-card__number {
  @apply text-3xl font-bold text-gray-800;
}

.gauge-card__unit {
  @apply text-lg text-gray-500 ml-0.5;
}

.gauge-card__subtitle {
  @apply text-sm text-gray-600;
}
</style>
