<template>
  <button
    v-haptic:medium
    class="plant-card"
    :class="`plant-card--${healthStatus}`"
    :aria-label="`View ${plant.name} details. Moisture: ${plant.statistics.moisturePercent}%, Battery: ${plant.statistics.batteryPercent}%`"
    @click="$emit('select', plant.deviceId)"
  >
    <div class="plant-card__header">
      <div class="plant-card__identity">
        <h3 class="plant-card__name">{{ plant.name }}</h3>
        <span class="plant-card__timestamp">Updated {{ formatRelativeTime(plant.updatedAt) }}</span>
      </div>
      <svg class="plant-card__chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>

    <div class="plant-card__moisture">
      <div class="plant-card__moisture-bar">
        <div
          class="plant-card__moisture-fill"
          :class="`plant-card__moisture-fill--${moistureStatus}`"
          :style="{ width: `${plant.statistics.moisturePercent}%` }"
        ></div>
      </div>
      <div class="plant-card__moisture-info">
        <span class="plant-card__moisture-value">{{ plant.statistics.moisturePercent }}%</span>
        <span class="plant-card__moisture-label">Moisture</span>
      </div>
    </div>

    <div class="plant-card__metrics">
      <div class="plant-card__metric">
        <BatteryIcon :level="plant.statistics.batteryPercent" class="w-5 h-5" />
        <span>{{ plant.statistics.batteryPercent }}%</span>
      </div>
      <div class="plant-card__metric">
        <WifiStrengthBars :rssi="plant.statistics.wifiRssi" />
        <span>{{ getWifiLabel(plant.statistics.wifiRssi) }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Plant } from '../types/plant'
import BatteryIcon from './BatteryIcon.vue'
import WifiStrengthBars from './WifiStrengthBars.vue'
import {
  getMoistureStatus,
  getOverallHealth,
  getWifiLabel,
  formatRelativeTime
} from '../composables/usePlantStatus'

const props = defineProps<{ plant: Plant }>()

defineEmits<{ select: [deviceId: string] }>()

const moistureStatus = computed(() => getMoistureStatus(props.plant.statistics.moisturePercent))
const healthStatus = computed(() =>
  getOverallHealth(props.plant.statistics.moisturePercent, props.plant.statistics.batteryPercent)
)
</script>

<style scoped>
.plant-card {
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  text-align: left;
  width: 100%;
  border-left: 4px solid var(--color-success-solid);
  min-height: 140px;
}

.plant-card:active {
  transform: scale(0.98);
  border-color: var(--color-border-secondary);
}

.plant-card--warning {
  border-left-color: var(--color-warning-solid);
}

.plant-card--critical {
  border-left-color: var(--color-error-solid);
}

.plant-card--saturated {
  border-left-color: var(--color-info-solid);
}

.plant-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.plant-card__identity {
  flex: 1;
}

.plant-card__name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.plant-card__timestamp {
  font-size: var(--font-size-11);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
  display: block;
}

.plant-card__chevron {
  width: 20px;
  height: 20px;
  color: var(--color-text-faint);
  flex-shrink: 0;
}

.plant-card__moisture {
  margin-bottom: var(--space-4);
}

.plant-card__moisture-bar {
  height: 12px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.plant-card__moisture-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: all var(--duration-normal) var(--ease-in-out);
  background: linear-gradient(90deg, var(--color-success-solid), #4ADE80);
}

.plant-card__moisture-fill--warning {
  background: linear-gradient(90deg, var(--color-warning-solid), #FBBF24);
}

.plant-card__moisture-fill--critical {
  background: linear-gradient(90deg, var(--color-error-solid), #F87171);
}

.plant-card__moisture-fill--saturated {
  background: linear-gradient(90deg, var(--color-info-solid), #60A5FA);
}

.plant-card__moisture-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plant-card__moisture-value {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.plant-card__moisture-label {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
}

.plant-card__metrics {
  display: flex;
  gap: var(--space-6);
}

.plant-card__metric {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-13);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
