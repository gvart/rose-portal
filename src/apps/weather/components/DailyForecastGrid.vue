<template>
  <div class="daily-forecast">
    <div class="forecast-list">
      <div v-for="day in daily" :key="day.date.toISOString()" class="glass-day-row">
        <div class="day-name">{{ day.dayName }}</div>
        <WeatherIcon :type="day.icon" class="day-icon" />
        <div class="day-temps">
          <span class="temp-low">{{ Math.round(day.tempLow) }}°</span>
          <div class="temp-bar"></div>
          <span class="temp-high">{{ Math.round(day.tempHigh) }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DailyForecast } from '../types/weather'
import WeatherIcon from './WeatherIcon.vue'

defineProps<{
  daily: DailyForecast[]
}>()
</script>

<style scoped>
.daily-forecast {
  margin-bottom: var(--space-6);
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.glass-day-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-in-out);
  color: white;
}

.glass-day-row:active {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(0.99);
}

.day-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  min-width: 50px;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-14);
  letter-spacing: 0.01em;
}

.day-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.day-temps {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: var(--font-size-14);
}

.temp-bar {
  width: 60px;
  height: var(--space-1);
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.4) 0%, rgba(239, 68, 68, 0.4) 100%);
  border-radius: var(--radius-xs);
}

.temp-low {
  font-weight: var(--font-weight-normal);
  opacity: 0.7;
  min-width: 32px;
  text-align: right;
}

.temp-high {
  font-weight: var(--font-weight-semibold);
  min-width: 32px;
}
</style>
