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
  @apply bg-white rounded-xl shadow-md p-5 cursor-pointer
         transition-all duration-150 hover:shadow-lg
         active:scale-[0.98] text-left w-full;
  border-left: 4px solid #22C55E;
  min-height: 140px;
}

.plant-card--warning {
  border-left-color: #F59E0B;
}

.plant-card--critical {
  border-left-color: #EF4444;
}

.plant-card--saturated {
  border-left-color: #3B82F6;
}

.plant-card__header {
  @apply flex items-start justify-between mb-4;
}

.plant-card__identity {
  @apply flex-1;
}

.plant-card__name {
  @apply text-xl font-semibold text-gray-800;
}

.plant-card__timestamp {
  @apply text-sm text-gray-500 mt-1 block;
}

.plant-card__chevron {
  @apply w-5 h-5 text-gray-400 flex-shrink-0;
}

.plant-card__moisture {
  @apply mb-4;
}

.plant-card__moisture-bar {
  @apply h-3 bg-gray-200 rounded-full overflow-hidden mb-2;
}

.plant-card__moisture-fill {
  @apply h-full rounded-full transition-all duration-500;
  background: linear-gradient(90deg, #22C55E, #4ADE80);
}

.plant-card__moisture-fill--warning {
  background: linear-gradient(90deg, #F59E0B, #FBBF24);
}

.plant-card__moisture-fill--critical {
  background: linear-gradient(90deg, #EF4444, #F87171);
}

.plant-card__moisture-fill--saturated {
  background: linear-gradient(90deg, #3B82F6, #60A5FA);
}

.plant-card__moisture-info {
  @apply flex justify-between items-center;
}

.plant-card__moisture-value {
  @apply text-lg font-bold text-gray-800;
}

.plant-card__moisture-label {
  @apply text-sm text-gray-500;
}

.plant-card__metrics {
  @apply flex gap-6;
}

.plant-card__metric {
  @apply flex items-center gap-2 text-sm text-gray-600;
}
</style>
