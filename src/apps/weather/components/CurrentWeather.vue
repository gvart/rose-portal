<template>
  <div class="current-weather-hero">
    <!-- Ultra Large Temperature -->
    <div
      class="hero-temp"
      v-motion
      :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }"
    >
      {{ Math.round(current.temperature) }}°
    </div>

    <!-- Weather Condition -->
    <div
      class="hero-condition"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
    >
      {{ formatCondition(current.condition) }}
    </div>

    <!-- Feels Like (subtle) -->
    <div
      class="hero-feels-like"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 0.9, transition: { delay: 200 } }"
    >
      Feels like {{ Math.round(current.apparentTemperature) }}°
    </div>

    <!-- Minimal Metrics Glass Panel -->
    <div
      class="glass-metrics"
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 300, type: 'spring' } }"
    >
      <div class="metric-item">
        <div class="metric-icon">💨</div>
        <div class="metric-value">{{ Math.round(current.windSpeed) }}</div>
        <div class="metric-label">km/h</div>
      </div>
      <div class="metric-item">
        <div class="metric-icon">💧</div>
        <div class="metric-value">{{ current.precipitation.toFixed(1) }}</div>
        <div class="metric-label">mm</div>
      </div>
      <div class="metric-item">
        <div class="metric-icon">☁️</div>
        <div class="metric-value">{{ Math.round(current.cloudCover) }}</div>
        <div class="metric-label">%</div>
      </div>
    </div>

    <!-- Clothing Recommendation Button -->
    <ClothingRecommendationButton
      v-motion
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
      :state="store.clothingButtonState"
      @click="showClothingModal = true"
    />

    <!-- Clothing Recommendation Modal -->
    <ClothingRecommendationModal
      v-model="showClothingModal"
      :recommendations="store.clothingRecommendations"
      :loading="store.clothingLoading"
      :error="store.clothingError"
      @retry="store.retryClothingRecommendation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CurrentWeather } from '../types/weather'
import { useWeatherStore } from '../stores/weatherStore'
import ClothingRecommendationButton from './ClothingRecommendationButton.vue'
import ClothingRecommendationModal from './ClothingRecommendationModal.vue'

defineProps<{
  current: CurrentWeather
}>()

const store = useWeatherStore()
const showClothingModal = ref(false)

function formatCondition(condition: string): string {
  return condition
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.current-weather-hero {
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  color: white;
}

.hero-temp {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: clamp(4rem, 10vw, 6rem);
  font-weight: 100;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.02em;
}

.hero-condition {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 300;
  margin-top: 0.25rem;
  text-transform: capitalize;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.hero-feels-like {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 300;
  opacity: 0.9;
  margin-top: 0.125rem;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Metrics Panel */
.glass-metrics {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  margin-top: var(--space-6);
  padding: var(--space-4) var(--space-6);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.metric-icon {
  font-size: 1.25rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.metric-value {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.metric-label {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  font-size: 0.625rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
</style>
