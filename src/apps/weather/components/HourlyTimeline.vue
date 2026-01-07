<template>
  <div class="hourly-timeline">
    <div class="timeline-scroll">
      <div class="timeline-track">
        <div v-for="hour in hourly" :key="hour.time.toISOString()" class="glass-hour-card">
          <div class="hour-time">{{ formatHour(hour.time) }}</div>
          <WeatherIcon :type="hour.icon" class="hour-icon" />
          <div class="hour-temp">{{ Math.round(hour.temperature) }}°</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HourlyForecast } from '../types/weather'
import WeatherIcon from './WeatherIcon.vue'

defineProps<{
  hourly: HourlyForecast[]
}>()

function formatHour(date: Date): string {
  const now = new Date()
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear() &&
    date.getHours() === now.getHours()
  ) {
    return 'Now'
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false
  }).format(date)
}
</script>

<style scoped>
.hourly-timeline {
  margin-bottom: 1.5rem;
}

.timeline-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.timeline-scroll::-webkit-scrollbar {
  display: none;
}

.timeline-track {
  display: flex;
  gap: 0.5rem;
  padding: 0 0.25rem 0.5rem;
}

.glass-hour-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0.75rem;
  min-width: 70px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  color: white;
}

.glass-hour-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.hour-time {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.9;
  letter-spacing: 0.01em;
}

.hour-icon {
  width: 2rem;
  height: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.hour-temp {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
</style>
