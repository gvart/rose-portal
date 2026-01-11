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
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.alert-card {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 2px solid;
}

.alert-card--low {
  background: var(--color-warning-bg);
  border-color: var(--color-warning-border);
  color: var(--color-warning-text);
}

.alert-card--medium {
  background: #FFF7ED;
  border-color: #FB923C;
  color: #9A3412;
}

.alert-card--high {
  background: var(--color-error-bg);
  border-color: var(--color-error-border);
  color: var(--color-error-text);
}

.alert-card--extreme {
  background: #FAF5FF;
  border-color: #A855F7;
  color: #6B21A8;
}

.alert-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-1);
}

.alert-description {
  font-size: var(--font-size-13);
}
</style>
