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

.value.active {
  color: var(--color-success-solid);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding: var(--space-2);
  background: var(--color-success-bg);
  border-radius: var(--radius-xs);
}

.pulse {
  width: 12px;
  height: 12px;
  background: var(--color-success-solid);
  border-radius: var(--radius-full);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: var(--font-size-14);
  color: var(--color-success-text);
  font-weight: var(--font-weight-medium);
}
</style>
