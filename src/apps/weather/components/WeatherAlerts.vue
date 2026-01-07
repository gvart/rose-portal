<template>
  <div class="weather-alerts">
    <div
      v-for="alert in alerts"
      :key="alert.id"
      class="alert-card"
      :class="`alert-card--${alert.severity}`"
    >
      <div class="alert-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <!-- Warning Icon -->
          <path
            v-if="alert.type === 'high-wind' || alert.type === 'storm'"
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-if="alert.type === 'high-wind' || alert.type === 'storm'"
            d="M12 9v4m0 4h.01"
            stroke-width="2"
            stroke-linecap="round"
          />

          <!-- Droplet Icon -->
          <path
            v-else-if="alert.type === 'heavy-rain'"
            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Thermometer Icon -->
          <path
            v-else-if="alert.type === 'extreme-heat' || alert.type === 'extreme-cold'"
            d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <div class="alert-content">
        <div class="alert-title">{{ alert.title }}</div>
        <div class="alert-description">{{ alert.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeatherAlert } from '../types/weather'

defineProps<{
  alerts: WeatherAlert[]
}>()
</script>

<style scoped>
.weather-alerts {
  @apply space-y-3 mb-6;
}

.alert-card {
  @apply flex gap-3 p-4 rounded-lg border-2 shadow-md;
}

.alert-card--low {
  @apply bg-yellow-50 border-yellow-300 text-yellow-900;
}

.alert-card--medium {
  @apply bg-orange-50 border-orange-400 text-orange-900;
}

.alert-card--high {
  @apply bg-red-50 border-red-400 text-red-900;
}

.alert-card--extreme {
  @apply bg-purple-50 border-purple-500 text-purple-900;
}

.alert-icon {
  @apply flex-shrink-0 w-8 h-8;
}

.alert-icon svg {
  @apply w-full h-full;
}

.alert-content {
  @apply flex-1 min-w-0;
}

.alert-title {
  @apply text-sm font-bold mb-1;
}

.alert-description {
  @apply text-sm;
}
</style>
