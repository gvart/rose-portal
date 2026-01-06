<template>
  <MetricCard title="Disk Storage">
    <div class="metric-row">
      <span class="label">Free:</span>
      <span class="value">{{ formatBytes(metrics.free) }}</span>
    </div>
    <div class="metric-row">
      <span class="label">Total:</span>
      <span class="value">{{ formatBytes(metrics.total) }}</span>
    </div>
    <div class="metric-row">
      <span class="label">Used:</span>
      <span class="value">{{ formatBytes(metrics.used) }}</span>
    </div>
    <div class="usage-bar-container">
      <div class="usage-bar" :style="{ width: `${metrics.usagePercent}%` }"></div>
    </div>
    <p class="usage-text">{{ metrics.usagePercent.toFixed(1) }}% used</p>
  </MetricCard>
</template>

<script setup lang="ts">
import MetricCard from './MetricCard.vue'
import type { DiskMetrics } from '../types'

defineProps<{
  metrics: DiskMetrics
}>()

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`
}
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

.usage-bar-container {
  @apply w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-2;
}

.usage-bar {
  @apply h-full bg-blue-600 transition-all duration-300;
}

.usage-text {
  @apply text-center text-sm text-gray-600 mt-1;
}
</style>
