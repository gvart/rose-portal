<template>
  <div class="location-selector">
    <div class="location-display">
      <q-icon name="location_on" color="info" size="20px" class="location-icon" />
      <div class="location-info">
        <div v-if="location" class="location-coords">
          {{ location.latitude.toFixed(4) }}°, {{ location.longitude.toFixed(4) }}°
        </div>
        <div v-else class="location-placeholder">No location</div>
      </div>
    </div>
    <q-btn
      icon="refresh"
      flat
      round
      dense
      color="info"
      @click="$emit('refresh')"
      :loading="loading"
      :disable="loading"
      aria-label="Refresh location"
    />
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
</style>
