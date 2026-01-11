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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-row.total {
  border-top: 1px solid var(--color-border-primary);
  padding-top: var(--space-2);
  margin-top: var(--space-2);
}

.label {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-18);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
