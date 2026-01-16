<template>
  <q-card
    class="plant-card"
    :class="`plant-card--${healthStatus}`"
    :aria-label="`View ${plant.name} details. Moisture: ${plant.statistics.moisturePercent}%, Battery: ${plant.statistics.batteryPercent}%`"
    @click="$emit('select', plant.deviceId)"
    clickable
    v-ripple
  >
    <q-card-section>
      <div class="plant-card__header">
        <div class="plant-card__identity">
          <h3 class="plant-card__name">{{ plant.name }}</h3>
          <span class="plant-card__timestamp">Updated {{ formatRelativeTime(plant.updatedAt) }}</span>
        </div>
        <q-icon name="chevron_right" size="20px" color="grey-5" />
      </div>

      <div class="plant-card__moisture">
        <q-linear-progress
          :value="plant.statistics.moisturePercent / 100"
          :color="moistureProgressColor"
          rounded
          size="12px"
          class="plant-card__moisture-bar"
        />
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
    </q-card-section>
  </q-card>
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

const moistureProgressColor = computed(() => {
  const colorMap = {
    good: 'positive',
    warning: 'warning',
    critical: 'negative',
    saturated: 'info'
  }
  return colorMap[moistureStatus.value]
})
</script>

<style scoped>
.plant-card {
  border-left: 4px solid var(--color-success-solid);
  min-height: 140px;
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.plant-card:active {
  transform: scale(0.98);
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

.plant-card__moisture {
  margin-bottom: var(--space-4);
}

.plant-card__moisture-bar {
  margin-bottom: var(--space-2);
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
