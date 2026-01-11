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
  margin-bottom: var(--space-6);
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
  gap: var(--space-2);
  padding: 0 var(--space-1) var(--space-2);
}

.glass-hour-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3);
  min-width: 70px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-in-out);
  color: white;
}

.glass-hour-card:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.98);
}

.hour-time {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-medium);
  opacity: 0.9;
  letter-spacing: 0.01em;
}

.hour-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.hour-temp {
  font-family: var(--font-mono);
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
</style>
