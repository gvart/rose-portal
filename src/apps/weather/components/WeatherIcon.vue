<template>
  <svg
    :class="['weather-icon', `weather-icon--${type}`]"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Sun -->
    <g v-if="type === 'sun'" class="animated-sun">
      <circle cx="50" cy="50" r="20" fill="currentColor" />
      <g class="sun-rays">
        <path
          v-for="i in 8"
          :key="i"
          :d="sunRay(i)"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>
    </g>

    <!-- Sun with Cloud -->
    <g v-else-if="type === 'sun-cloud'" class="animated-sun-cloud">
      <g class="sun-part">
        <circle cx="35" cy="35" r="12" fill="#FCD34D" />
        <path
          d="M 28,30 L 28,20 M 42,30 L 42,20 M 35,23 L 35,13 M 35,47 L 35,37 M 23,35 L 13,35 M 47,35 L 57,35"
          stroke="#FCD34D"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>
      <path
        class="cloud-part"
        d="M 55,50 Q 50,40 60,40 Q 70,40 72,48 Q 78,48 78,55 Q 78,62 72,62 L 60,62 Q 52,62 52,55 Q 52,50 55,50 Z"
        fill="#E5E7EB"
      />
    </g>

    <!-- Cloud -->
    <g v-else-if="type === 'cloud'" class="animated-cloud">
      <path
        d="M 30,50 Q 25,40 35,40 Q 45,40 47,48 Q 53,48 53,55 Q 53,62 47,62 L 35,62 Q 27,62 27,55 Q 27,50 30,50 Z"
        fill="currentColor"
      />
    </g>

    <!-- Multiple Clouds -->
    <g v-else-if="type === 'clouds'" class="animated-clouds">
      <path
        class="cloud-back"
        d="M 25,45 Q 20,35 30,35 Q 40,35 42,43 Q 48,43 48,50 Q 48,57 42,57 L 30,57 Q 22,57 22,50 Q 22,45 25,45 Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        class="cloud-front"
        d="M 35,55 Q 30,45 40,45 Q 50,45 52,53 Q 58,53 58,60 Q 58,67 52,67 L 40,67 Q 32,67 32,60 Q 32,55 35,55 Z"
        fill="currentColor"
      />
    </g>

    <!-- Rain -->
    <g v-else-if="type === 'rain'" class="animated-rain">
      <path
        d="M 30,40 Q 25,30 35,30 Q 45,30 47,38 Q 53,38 53,45 Q 53,52 47,52 L 35,52 Q 27,52 27,45 Q 27,40 30,40 Z"
        fill="currentColor"
      />
      <g class="rain-drops">
        <path
          d="M 32,58 L 32,70"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.7"
          class="rain-drop-1"
        />
        <path
          d="M 40,58 L 40,70"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.7"
          class="rain-drop-2"
        />
        <path
          d="M 48,58 L 48,70"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.7"
          class="rain-drop-3"
        />
      </g>
    </g>

    <!-- Heavy Rain -->
    <g v-else-if="type === 'heavy-rain'" class="animated-heavy-rain">
      <path
        d="M 30,35 Q 25,25 35,25 Q 45,25 47,33 Q 53,33 53,40 Q 53,47 47,47 L 35,47 Q 27,47 27,40 Q 27,35 30,35 Z"
        fill="currentColor"
      />
      <g class="heavy-rain-drops">
        <path
          d="M 28,53 L 28,70"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop-1"
        />
        <path
          d="M 35,53 L 35,70"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop-2"
        />
        <path
          d="M 42,53 L 42,70"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop-3"
        />
        <path
          d="M 49,53 L 49,70"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          class="rain-drop-4"
        />
      </g>
    </g>

    <!-- Wind -->
    <g v-else-if="type === 'wind'" class="animated-wind">
      <path
        class="wind-streak-1"
        d="M 20,35 Q 30,30 40,35 Q 50,40 60,35"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        fill="none"
      />
      <path
        class="wind-streak-2"
        d="M 15,50 Q 25,45 35,50 Q 45,55 55,50 Q 65,45 75,50"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        fill="none"
      />
      <path
        class="wind-streak-3"
        d="M 20,65 Q 30,60 40,65 Q 50,70 60,65"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        fill="none"
      />
    </g>

    <!-- Fog -->
    <g v-else-if="type === 'fog'" class="animated-fog">
      <path
        d="M 20,30 L 80,30 M 15,45 L 75,45 M 25,60 L 85,60 M 20,75 L 80,75"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        opacity="0.6"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import type { WeatherIconType } from '../types/weather'

defineProps<{
  type: WeatherIconType
}>()

/**
 * Generate sun ray path for given index (0-7)
 */
function sunRay(index: number): string {
  const angle = (index * 45 * Math.PI) / 180
  const innerRadius = 25
  const outerRadius = 35
  const cx = 50
  const cy = 50

  const x1 = cx + Math.cos(angle) * innerRadius
  const y1 = cy + Math.sin(angle) * innerRadius
  const x2 = cx + Math.cos(angle) * outerRadius
  const y2 = cy + Math.sin(angle) * outerRadius

  return `M ${x1},${y1} L ${x2},${y2}`
}
</script>

<style scoped>
.weather-icon {
  display: inline-block;
  width: 100%;
  height: 100%;
}

/* Sun animations */
.weather-icon--sun {
  color: #FCD34D;
}

.animated-sun .sun-rays {
  animation: rotate-rays 20s linear infinite;
  transform-origin: 50% 50%;
}

@keyframes rotate-rays {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Sun with cloud animations */
.animated-sun-cloud .sun-part {
  animation: pulse-sun 3s ease-in-out infinite;
  transform-origin: 35% 35%;
}

.animated-sun-cloud .cloud-part {
  animation: float-cloud 4s ease-in-out infinite;
}

@keyframes pulse-sun {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes float-cloud {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(3px) translateY(-2px);
  }
}

/* Cloud animations */
.weather-icon--cloud {
  color: #9CA3AF;
}

.animated-cloud path {
  animation: float-cloud 6s ease-in-out infinite;
}

/* Multiple clouds animations */
.weather-icon--clouds {
  color: #6B7280;
}

.animated-clouds .cloud-back {
  animation: float-cloud 7s ease-in-out infinite;
}

.animated-clouds .cloud-front {
  animation: float-cloud 5s ease-in-out infinite;
}

/* Rain animations */
.weather-icon--rain {
  color: #3B82F6;
}

.rain-drops .rain-drop-1 {
  animation: rain-drop 1.5s ease-in infinite;
}

.rain-drops .rain-drop-2 {
  animation: rain-drop 1.5s 0.3s ease-in infinite;
}

.rain-drops .rain-drop-3 {
  animation: rain-drop 1.5s 0.6s ease-in infinite;
}

@keyframes rain-drop {
  0% {
    transform: translateY(-8px);
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(4px);
    opacity: 0;
  }
}

/* Heavy rain animations */
.weather-icon--heavy-rain {
  color: #1E40AF;
}

.heavy-rain-drops .rain-drop-1 {
  animation: rain-drop 1s ease-in infinite;
}

.heavy-rain-drops .rain-drop-2 {
  animation: rain-drop 1s 0.2s ease-in infinite;
}

.heavy-rain-drops .rain-drop-3 {
  animation: rain-drop 1s 0.4s ease-in infinite;
}

.heavy-rain-drops .rain-drop-4 {
  animation: rain-drop 1s 0.6s ease-in infinite;
}

/* Wind animations */
.weather-icon--wind {
  color: #6B7280;
}

.animated-wind .wind-streak-1 {
  animation: wind-wave 2s ease-in-out infinite;
}

.animated-wind .wind-streak-2 {
  animation: wind-wave 2s 0.3s ease-in-out infinite;
}

.animated-wind .wind-streak-3 {
  animation: wind-wave 2s 0.6s ease-in-out infinite;
}

@keyframes wind-wave {
  0%, 100% {
    transform: translateX(0);
    opacity: 0.7;
  }
  50% {
    transform: translateX(5px);
    opacity: 1;
  }
}

/* Fog animations */
.weather-icon--fog {
  color: #9CA3AF;
}

.animated-fog path {
  animation: fog-drift 8s ease-in-out infinite;
}

@keyframes fog-drift {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-3px);
  }
}
</style>
