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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-4);
}

.location-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.location-icon {
  width: 20px;
  height: 20px;
  color: var(--color-info-solid);
  flex-shrink: 0;
}

.location-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.location-coords {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.location-placeholder {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
}

.refresh-btn {
  padding: var(--space-2);
  color: var(--color-info-solid);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.refresh-btn:active:not(:disabled) {
  background: var(--color-info-bg);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  width: 20px;
  height: 20px;
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
