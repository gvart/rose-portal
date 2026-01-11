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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.usage-bar-container {
  width: 100%;
  height: 16px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-2);
}

.usage-bar {
  height: 100%;
  background: var(--color-info-solid);
  transition: all var(--duration-normal) var(--ease-in-out);
}

.usage-text {
  text-align: center;
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  margin-top: var(--space-1);
}
</style>
