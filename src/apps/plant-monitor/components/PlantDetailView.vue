<template>
  <div ref="containerRef" class="plant-detail">
    <!-- Pull-to-refresh indicator -->
    <PullIndicator :state="pullState" :distance="pullDistance" :progress="pullProgress" />

    <div v-if="loading && !plant" class="loading-state">
      <LoadingSpinner message="Loading plant data..." />
    </div>

    <ErrorMessage v-else-if="error" :message="error" @retry="refresh" />

    <div v-else-if="plant" class="plant-detail-content">
    <div class="plant-header">
      <StatusBadge :status="healthStatus" />
      <div class="plant-header__actions">
        <div class="action-wrapper">
          <button
           
            class="action-btn action-btn--water"
            :disabled="actionInProgress || loading || isTooWetToWater || showWateringAnimation"
            @click="onWaterPlant"
            :title="wateringDisabledReason || ''"
          >
            <svg
              class="action-btn__icon"
              :class="{ 'animate-bounce': actionInProgress }"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
            </svg>
            <span class="action-btn__label">{{ actionInProgress ? 'Watering...' : 'Water' }}</span>
          </button>
          <p v-if="isTooWetToWater && !loading" class="action-hint">
            Plant is already wet enough
          </p>
        </div>

        <button
         
          class="action-btn action-btn--config"
          :disabled="loading"
          @click="onOpenConfig"
        >
          <svg
            class="action-btn__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span class="action-btn__label">Config</span>
        </button>
      </div>
    </div>

    <div class="gauge-grid">
      <GaugeCard
        title="Moisture"
        :value="plant.statistics.moisturePercent"
        :max="100"
        unit="%"
        :status="moistureStatus"
        :subtitle="getMoistureMessage(plant.statistics.moisturePercent)"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
          </svg>
        </template>
      </GaugeCard>

      <GaugeCard
        title="Battery"
        :value="plant.statistics.batteryPercent"
        :max="100"
        unit="%"
        :status="batteryStatus"
        :subtitle="`${plant.statistics.batteryVoltage.toFixed(2)}V`"
      >
        <template #icon>
          <BatteryIcon :level="plant.statistics.batteryPercent" />
        </template>
      </GaugeCard>
    </div>

    <MetricCard title="Device Status">
      <StatusRow
        label="WiFi Signal"
        :value="getWifiLabel(plant.statistics.wifiRssi)"
        :detail="`${plant.statistics.wifiRssi} dBm`"
        :status="wifiStatus"
      >
        <template #visual>
          <WifiStrengthBars :rssi="plant.statistics.wifiRssi" />
        </template>
      </StatusRow>

      <StatusRow label="Uptime" :value="formatUptime(plant.statistics.uptimeSeconds)" />

      <StatusRow label="Total Waterings" :value="plant.statistics.wateringCount.toString()" />

      <StatusRow label="Device ID" :value="plant.deviceId" />
    </MetricCard>

    <MetricCard title="Data Freshness">
      <StatusRow
        label="Last Update"
        :value="formatRelativeTime(plant.updatedAt)"
        :detail="formatDateTime(plant.updatedAt)"
      />
      <StatusRow label="Device Added" :value="formatDate(plant.createdAt)" />
    </MetricCard>

    <!-- Success Message -->
    <div v-if="actionSuccess" class="success-message">
      <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ actionSuccess }}</span>
    </div>
    </div>

    <!-- Config Modal -->
    <PlantConfigModal
      v-if="plant"
      v-model="showConfigModal"
      :plant="plant"
      :save-in-progress="configInProgress"
      @save="onSaveConfig"
    />

    <!-- Watering Animation -->
    <WateringAnimation
      v-if="plant"
      :show="showWateringAnimation"
      :duration-ms="plant.config.pumpDuration"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Plant, PlantConfig } from '../types/plant'
import { rawToPercentage } from '../types/plant'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import PullIndicator from '@/components/common/PullIndicator.vue'
import StatusBadge from './StatusBadge.vue'
import GaugeCard from './GaugeCard.vue'
import MetricCard from './MetricCard.vue'
import StatusRow from './StatusRow.vue'
import BatteryIcon from './BatteryIcon.vue'
import WifiStrengthBars from './WifiStrengthBars.vue'
import PlantConfigModal from './PlantConfigModal.vue'
import WateringAnimation from './WateringAnimation.vue'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import {
  getMoistureStatus,
  getBatteryStatus,
  getWifiStatus,
  getOverallHealth,
  getMoistureMessage,
  getWifiLabel,
  formatUptime,
  formatRelativeTime,
  formatDateTime,
  formatDate
} from '../composables/usePlantStatus'

const props = defineProps<{
  plant: Plant | null
  loading: boolean
  error: string | null
  actionInProgress: boolean
  actionSuccess: string | null
  configInProgress: boolean
}>()

const emit = defineEmits<{
  refresh: []
  water: [deviceId: string]
  updateConfig: [deviceId: string, config: PlantConfig & { name: string }]
}>()

// Pull-to-refresh setup
const containerRef = ref<HTMLElement | null>(null)
const { pullState, pullDistance, pullProgress } = usePullToRefresh(containerRef, {
  threshold: 50,
  resistance: 1.5,
  maxPull: 100,
  onRefresh: async () => {
    refresh()
    // Wait for loading to complete
    await new Promise(resolve => {
      const checkLoading = setInterval(() => {
        if (!props.loading) {
          clearInterval(checkLoading)
          resolve(undefined)
        }
      }, 100)
    })
  },
  hapticOnTrigger: true
})

// Config modal
const showConfigModal = ref(false)

// Watering animation
const showWateringAnimation = ref(false)

// Check if plant is too wet to water
const isTooWetToWater = computed(() => {
  if (!props.plant) return false
  const currentMoisture = rawToPercentage(props.plant.statistics.moistureRaw)
  const wetThreshold = rawToPercentage(props.plant.config.wetThreshold)
  return currentMoisture >= wetThreshold
})

const wateringDisabledReason = computed(() => {
  if (isTooWetToWater.value) {
    return 'Plant moisture is already above wet threshold'
  }
  return null
})

const moistureStatus = computed(() =>
  props.plant ? getMoistureStatus(props.plant.statistics.moisturePercent) : 'good'
)
const batteryStatus = computed(() =>
  props.plant ? getBatteryStatus(props.plant.statistics.batteryPercent) : 'good'
)
const wifiStatus = computed(() => (props.plant ? getWifiStatus(props.plant.statistics.wifiRssi) : 'good'))
const healthStatus = computed(() =>
  props.plant
    ? getOverallHealth(props.plant.statistics.moisturePercent, props.plant.statistics.batteryPercent)
    : 'good'
)

function refresh() {
  emit('refresh')
}

function onWaterPlant() {
  if (props.plant && !isTooWetToWater.value) {
    // Show animation for the duration of pump operation
    showWateringAnimation.value = true

    // Hide animation after pump duration
    setTimeout(() => {
      showWateringAnimation.value = false
    }, props.plant.config.pumpDuration)

    emit('water', props.plant.deviceId)
  }
}

function onOpenConfig() {
  showConfigModal.value = true
}

function onSaveConfig(config: PlantConfig & { name: string }) {
  if (props.plant) {
    emit('updateConfig', props.plant.deviceId, config)
    showConfigModal.value = false
  }
}
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
}

.plant-detail {
  width: 100%;
  position: relative;
}

.plant-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding-bottom: var(--space-8);
}

.plant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.plant-header__actions {
  display: flex;
  gap: var(--space-2);
}

.action-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.action-hint {
  font-size: var(--font-size-12);
  color: #d97706;
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.gauge-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .gauge-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-success-bg);
  border: 2px solid var(--color-success-border);
  border-radius: var(--radius-lg);
  color: var(--color-success-text);
  font-weight: var(--font-weight-medium);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: 44px;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn--water {
  background: var(--color-info-solid);
  color: white;
}

.action-btn--water:active:not(:disabled) {
  background: #2563eb;
}

.action-btn__icon {
  width: 20px;
  height: 20px;
}

.action-btn--water .action-btn__icon {
  color: rgba(255, 255, 255, 0.9);
}

.action-btn--config {
  background: var(--color-text-secondary);
  color: white;
}

.action-btn--config:active:not(:disabled) {
  background: var(--color-text-primary);
}

.action-btn--config .action-btn__icon {
  color: rgba(255, 255, 255, 0.9);
}

.action-btn__label {
  font-size: var(--font-size-13);
}

@media (min-width: 640px) {
  .action-btn__label {
    font-size: var(--font-size-14);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
