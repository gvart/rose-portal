<template>
  <MetricCard title="Connection Pool (Hikari)">
    <div class="metric-row">
      <span class="label">Active:</span>
      <span class="value">{{ metrics.active }}</span>
    </div>
    <div class="metric-row">
      <span class="label">Idle:</span>
      <span class="value">{{ metrics.idle }}</span>
    </div>
    <div class="metric-row">
      <span class="label">Total:</span>
      <span class="value">{{ metrics.total }}</span>
    </div>
    <div class="metric-row range">
      <span class="label">Range:</span>
      <span class="value">{{ metrics.min }} - {{ metrics.max }}</span>
    </div>
  </MetricCard>
</template>

<script setup lang="ts">
import MetricCard from './MetricCard.vue'
import type { HikariMetrics } from '../types'

defineProps<{
  metrics: HikariMetrics
}>()
</script>

<style scoped>
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-row.range {
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
