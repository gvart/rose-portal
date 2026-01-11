<template>
  <AppLayout title="Weather" theme-color="#3B82F6">
    <div class="weather-app" :class="[weatherBackgroundClass, { 'is-night': isNightTime }]">
      <!-- Animated Background Layer -->
      <div class="weather-bg-layer">
        <!-- Moon (Night time) -->
        <div v-if="isNightTime && isClear" class="moon">
          <div class="moon-glow"></div>
          <div class="stars">
            <div v-for="i in 30" :key="i" class="star" :style="starStyle(i)"></div>
          </div>
        </div>

        <!-- Sun Rays (Clear weather - Day only) -->
        <div v-else-if="!isNightTime && isClear" class="sun-rays">
          <div class="sun-ray" v-for="i in 12" :key="i" :style="sunRayStyle(i)"></div>
        </div>

        <!-- Floating Clouds (Cloudy weather) -->
        <div v-if="isCloudy" class="cloud-container">
          <div class="floating-cloud cloud-1"></div>
          <div class="floating-cloud cloud-2"></div>
          <div class="floating-cloud cloud-3"></div>
        </div>

        <!-- Rain Particles -->
        <div v-if="hasRainParticles" class="rain-container">
          <div
            v-for="i in rainDropCount"
            :key="`rain-${i}`"
            class="rain-drop"
            :style="rainDropStyle(i)"
          ></div>
        </div>

        <!-- Snow Particles -->
        <div v-if="isSnow" class="snow-container">
          <div
            v-for="i in 50"
            :key="`snow-${i}`"
            class="snow-flake"
            :style="snowFlakeStyle(i)"
          ></div>
        </div>

        <!-- Lightning Flash (Heavy Rain) -->
        <div v-if="isHeavyRain" class="lightning-flash"></div>
      </div>

      <!-- Error State -->
      <div v-if="store.error && !store.hasData" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Failed to Load Weather</div>
        <div class="error-message">{{ store.error }}</div>
        <button v-haptic @click="handleRetry" class="glass-btn">
          Try Again
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="store.loading && !store.hasData" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading weather...</div>
      </div>

      <!-- Main Content -->
      <div v-else-if="store.hasData" class="weather-content">
        <!-- Hero: Current Weather -->
        <CurrentWeather v-if="store.currentWeather" :current="store.currentWeather" />

        <!-- Glass Tab Navigation -->
        <div
          class="glass-tab-nav"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            v-haptic:light
            @click="currentTab = tab.id"
            class="glass-tab-btn"
            :class="{ active: currentTab === tab.id }"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Hourly Tab -->
          <div v-if="currentTab === 'hourly'" class="tab-panel">
            <TemperatureChart v-if="store.next24Hours.length" :hourly-data="store.next24Hours" />
            <HourlyTimeline v-if="store.hourlyForecast.length" :hourly="store.hourlyForecast.slice(0, 24)" />
          </div>

          <!-- Forecast Tab -->
          <div v-else-if="currentTab === 'forecast'" class="tab-panel">
            <DailyForecastGrid v-if="store.dailyForecast.length" :daily="store.dailyForecast" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🌤️</div>
        <div class="empty-title">Get Weather Forecast</div>
        <div class="empty-message">
          Allow location access to see weather data for your area
        </div>
        <button v-haptic @click="handleGetWeather" class="glass-btn">
          Get Weather
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useWeatherStore } from './stores/weatherStore'
import CurrentWeather from './components/CurrentWeather.vue'
import TemperatureChart from './components/TemperatureChart.vue'
import HourlyTimeline from './components/HourlyTimeline.vue'
import DailyForecastGrid from './components/DailyForecastGrid.vue'
import { getWeatherBackground } from './utils/weatherBackgrounds'

const store = useWeatherStore()

// Tabs - removed "overview" tab
const currentTab = ref<'hourly' | 'forecast'>('hourly')
const tabs = [
  { id: 'hourly' as const, label: 'Hourly' },
  { id: 'forecast' as const, label: 'Weekly' }
]

// Check if it's night time (6 PM - 6 AM)
const isNightTime = computed(() => {
  const hour = new Date().getHours()
  return hour >= 18 || hour < 6
})

// Weather Background
const weatherBackgroundClass = computed(() => {
  if (!store.currentWeather) return 'bg-clear'
  const bg = getWeatherBackground(store.currentWeather.condition)
  return bg.className
})

// Weather Effects
const isClear = computed(() => store.currentWeather?.condition === 'clear')

const isCloudy = computed(() => {
  if (!store.currentWeather) return false
  const condition = store.currentWeather.condition
  return ['partly-cloudy', 'cloudy', 'overcast'].includes(condition)
})

const hasRainParticles = computed(() => {
  if (!store.currentWeather) return false
  const condition = store.currentWeather.condition
  return ['light-rain', 'rain', 'heavy-rain'].includes(condition)
})

const isHeavyRain = computed(() => store.currentWeather?.condition === 'heavy-rain')

const isSnow = computed(() => store.currentWeather?.condition === 'snow')

const rainDropCount = computed(() => {
  if (!store.currentWeather) return 0
  const condition = store.currentWeather.condition
  if (condition === 'heavy-rain') return 100
  if (condition === 'rain') return 60
  return 40
})

function sunRayStyle(index: number) {
  const angle = (index * 30) // 12 rays, 30 degrees apart
  return {
    transform: `rotate(${angle}deg)`
  }
}

function starStyle(index: number) {
  return {
    top: `${Math.random() * 60}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    fontSize: `${Math.random() * 8 + 4}px`
  }
}

function rainDropStyle(index: number) {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${0.5 + Math.random() * 0.5}s`
  }
}

function snowFlakeStyle(index: number) {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 5}s`,
    fontSize: `${10 + Math.random() * 10}px`,
    opacity: Math.random() * 0.6 + 0.4
  }
}

onMounted(async () => {
  await store.fetchWeatherForCurrentLocation()
  store.startAutoRefresh()
})

onUnmounted(() => {
  store.stopAutoRefresh()
})

async function handleGetWeather() {
  await store.fetchWeatherForCurrentLocation()
}

async function handleRetry() {
  await store.fetchWeatherForCurrentLocation()
}
</script>

<style scoped>
/* Main Container with Animated Background */
.weather-app {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background 2s ease-in-out;
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* Weather Background Classes */
.weather-app.bg-clear {
  background: linear-gradient(135deg, #F59E0B 0%, #EA580C 100%);
}

/* Night mode overrides */
.weather-app.bg-clear.is-night {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
}

.weather-app.bg-partly-cloudy {
  background: linear-gradient(180deg, #60A5FA 0%, #DBEAFE 100%);
}

.weather-app.bg-partly-cloudy.is-night {
  background: linear-gradient(180deg, #1E3A8A 0%, #1E293B 100%);
}

.weather-app.bg-cloudy {
  background: linear-gradient(180deg, #9CA3AF 0%, #E5E7EB 100%);
}

.weather-app.bg-cloudy.is-night {
  background: linear-gradient(180deg, #374151 0%, #1F2937 100%);
}

.weather-app.bg-overcast {
  background: linear-gradient(180deg, #6B7280 0%, #D1D5DB 100%);
}

.weather-app.bg-overcast.is-night {
  background: linear-gradient(180deg, #4B5563 0%, #1F2937 100%);
}

.weather-app.bg-light-rain {
  background: linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%);
}

.weather-app.bg-light-rain.is-night {
  background: linear-gradient(180deg, #1E3A8A 0%, #1E293B 100%);
}

.weather-app.bg-rain {
  background: linear-gradient(180deg, #1E3A8A 0%, #475569 100%);
}

.weather-app.bg-rain.is-night {
  background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
}

.weather-app.bg-heavy-rain {
  background: linear-gradient(180deg, #1E293B 0%, #334155 100%);
}

.weather-app.bg-heavy-rain.is-night {
  background: linear-gradient(180deg, #0F172A 0%, #020617 100%);
}

.weather-app.bg-snow {
  background: linear-gradient(180deg, #E0F2FE 0%, #F0F9FF 100%);
}

.weather-app.bg-snow.is-night {
  background: linear-gradient(180deg, #334155 0%, #1E293B 100%);
}

.weather-app.bg-fog {
  background: linear-gradient(180deg, #6B7280 0%, #F3F4F6 100%);
}

.weather-app.bg-fog.is-night {
  background: linear-gradient(180deg, #374151 0%, #1F2937 100%);
}

.weather-app.bg-windy {
  background: linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%);
}

.weather-app.bg-windy.is-night {
  background: linear-gradient(135deg, #155E75 0%, #0C4A6E 100%);
}

/* Background Layer */
.weather-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Moon and Stars (Night) */
.moon {
  position: absolute;
  top: 15%;
  right: 15%;
  width: 120px;
  height: 120px;
}

.moon-glow {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #F8F9FA 0%, rgba(248, 249, 250, 0.8) 40%, transparent 70%);
  border-radius: 50%;
  box-shadow: 0 0 60px rgba(248, 249, 250, 0.4);
  animation: moon-pulse 8s ease-in-out infinite;
}

@keyframes moon-pulse {
  0%, 100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 60vh;
}

.star {
  position: absolute;
  color: white;
  animation: twinkle 3s ease-in-out infinite;
}

.star::before {
  content: '⭐';
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Sun Rays Animation */
.sun-rays {
  position: absolute;
  top: 15%;
  left: 50%;
  width: 500px;
  height: 500px;
  transform: translate(-50%, -50%);
  animation: rotate-sun 30s linear infinite;
}

@keyframes rotate-sun {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.sun-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 250px;
  height: 4px;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.6) 0%, transparent 100%);
  transform-origin: 0% 50%;
  filter: blur(2px);
}

/* Floating Clouds */
.cloud-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.floating-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  filter: blur(40px);
}

.cloud-1 {
  width: 200px;
  height: 100px;
  top: 20%;
  left: -10%;
  animation: float-cloud-1 20s linear infinite;
}

.cloud-2 {
  width: 300px;
  height: 150px;
  top: 40%;
  left: -15%;
  animation: float-cloud-2 25s linear infinite;
}

.cloud-3 {
  width: 250px;
  height: 120px;
  top: 60%;
  left: -12%;
  animation: float-cloud-3 22s linear infinite;
}

@keyframes float-cloud-1 {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(100vw + 200px));
  }
}

@keyframes float-cloud-2 {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(100vw + 300px));
  }
}

@keyframes float-cloud-3 {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(100vw + 250px));
  }
}

/* Rain Particles */
.rain-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

@keyframes rain-fall {
  0% {
    transform: translateY(-10vh) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(110vh) translateX(20px);
    opacity: 0;
  }
}

.rain-drop {
  position: absolute;
  width: 2px;
  height: 30px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.9));
  animation: rain-fall 1s linear infinite;
  top: -20px;
}

/* Snow Particles */
.snow-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

@keyframes snow-fall {
  0% {
    transform: translateY(-10vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(110vh) translateX(50px) rotate(360deg);
    opacity: 0;
  }
}

.snow-flake {
  position: absolute;
  color: white;
  user-select: none;
  animation: snow-fall 10s linear infinite;
  top: -10%;
}

.snow-flake::before {
  content: '❄';
}

/* Lightning Flash */
@keyframes lightning {
  0%, 10%, 20%, 100% {
    opacity: 0;
  }
  5%, 15% {
    opacity: 0.8;
  }
}

.lightning-flash {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  animation: lightning 8s infinite;
  pointer-events: none;
}

/* Main Content */
.weather-content {
  position: relative;
  z-index: 1;
  padding-bottom: 4rem;
}

/* Tab Navigation */
.glass-tab-nav {
  display: flex;
  gap: var(--space-2);
  margin: 0 var(--space-4) var(--space-4);
  padding: var(--space-1);
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
}

.glass-tab-btn {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.glass-tab-btn.active {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: var(--font-weight-semibold);
}

.glass-tab-btn:active:not(.active) {
  background: rgba(255, 255, 255, 0.15);
}

/* Tab Content */
.tab-content {
  padding: 0 1rem;
}

.tab-panel {
  /* Removed glitchy animation */
}

/* Error State */
.error-state {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
  color: white;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.error-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.error-message {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 300;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 300px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Loading State */
.loading-state {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 300;
  opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Empty State */
.empty-state {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
  color: white;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.empty-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.empty-message {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 300;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 320px;
  line-height: 1.5;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Button */
.glass-btn {
  padding: var(--space-4) var(--space-8);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-semibold);
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.glass-btn:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.25);
}
</style>
