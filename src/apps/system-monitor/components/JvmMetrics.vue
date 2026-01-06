<template>
  <MetricCard title="JVM Memory">
    <div class="metric-row">
      <span class="label">Heap:</span>
      <span class="value">{{ formatBytes(metrics.heap) }}</span>
    </div>
    <div class="metric-row">
      <span class="label">Non-Heap:</span>
      <span class="value">{{ formatBytes(metrics.nonHeap) }}</span>
    </div>
    <div class="metric-row total">
      <span class="label">Total:</span>
      <span class="value">{{ formatBytes(metrics.total) }}</span>
    </div>
  </MetricCard>
</template>

<script setup lang="ts">
import MetricCard from './MetricCard.vue'
import type { JvmMemoryMetrics } from '../types'

defineProps<{
  metrics: JvmMemoryMetrics
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

.metric-row.total {
  @apply border-t pt-2 mt-2;
}

.label {
  @apply text-gray-600 font-medium;
}

.value {
  @apply text-gray-900 font-semibold text-lg;
}
</style>
