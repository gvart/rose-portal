<template>
  <MetricCard title="AI Operations">
    <div class="metric-row">
      <span class="label">Active Operations:</span>
      <span class="value" :class="{ 'active': metrics.activeOperations > 0 }">
        {{ metrics.activeOperations }}
      </span>
    </div>
    <div class="metric-row">
      <span class="label">Total Operations:</span>
      <span class="value">{{ metrics.totalOperations }}</span>
    </div>
    <div v-if="metrics.activeOperations > 0" class="status-indicator">
      <span class="pulse"></span>
      <span class="status-text">Processing...</span>
    </div>
  </MetricCard>
</template>

<script setup lang="ts">
import MetricCard from './MetricCard.vue'
import type { AiMetrics } from '../types'

defineProps<{
  metrics: AiMetrics
}>()
</script>

<style scoped>
.metric-row {
  @apply flex justify-between items-center;
}

.label {
  @apply text-gray-600 font-medium;
}

.value {
  @apply text-gray-900 font-semibold text-lg;
}

.value.active {
  @apply text-green-600;
}

.status-indicator {
  @apply flex items-center gap-2 mt-3 p-2 bg-green-50 rounded;
}

.pulse {
  @apply w-3 h-3 bg-green-600 rounded-full animate-pulse;
}

.status-text {
  @apply text-sm text-green-700 font-medium;
}
</style>
