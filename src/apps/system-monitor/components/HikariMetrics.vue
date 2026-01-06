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
  @apply flex justify-between items-center;
}

.metric-row.range {
  @apply border-t pt-2 mt-2;
}

.label {
  @apply text-gray-600 font-medium;
}

.value {
  @apply text-gray-900 font-semibold text-lg;
}
</style>
