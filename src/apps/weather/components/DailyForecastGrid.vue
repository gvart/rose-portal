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
  margin-bottom: 1.5rem;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.glass-day-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  transition: all 0.2s ease;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.glass-day-row:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.day-name {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  min-width: 50px;
  font-weight: 500;
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
}

.day-icon {
  width: 2rem;
  height: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.day-temps {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  font-size: 0.9375rem;
}

.temp-bar {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.4) 0%, rgba(239, 68, 68, 0.4) 100%);
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.temp-low {
  font-weight: 400;
  opacity: 0.7;
  min-width: 32px;
  text-align: right;
}

.temp-high {
  font-weight: 600;
  min-width: 32px;
}
</style>
