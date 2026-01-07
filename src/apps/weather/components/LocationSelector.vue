<template>
  <div class="location-selector">
    <div class="location-display">
      <svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="10" r="3" stroke-width="2" />
      </svg>
      <div class="location-info">
        <div v-if="location" class="location-coords">
          {{ location.latitude.toFixed(4) }}°, {{ location.longitude.toFixed(4) }}°
        </div>
        <div v-else class="location-placeholder">No location</div>
      </div>
    </div>
    <button
      v-haptic:light
      @click="$emit('refresh')"
      class="refresh-btn"
      :disabled="loading"
      aria-label="Refresh location"
    >
      <svg
        class="refresh-icon"
        :class="{ 'animate-spin': loading }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { WeatherLocation } from '../types/weather'

defineProps<{
  location: WeatherLocation | null
  loading?: boolean
}>()

defineEmits<{
  refresh: []
}>()
</script>

<style scoped>
.location-selector {
  @apply flex items-center justify-between gap-3 p-3 bg-white rounded-lg shadow-sm mb-4;
}

.location-display {
  @apply flex items-center gap-2 flex-1 min-w-0;
}

.location-icon {
  @apply w-5 h-5 text-blue-500 flex-shrink-0;
}

.location-info {
  @apply flex flex-col min-w-0;
}

.location-coords {
  @apply text-sm font-medium text-gray-900 truncate;
}

.location-placeholder {
  @apply text-sm text-gray-500;
}

.refresh-btn {
  @apply p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed;
}

.refresh-icon {
  @apply w-5 h-5;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
