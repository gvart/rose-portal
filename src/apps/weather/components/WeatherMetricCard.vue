<template>
  <div class="metric-card">
    <div class="metric-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <!-- Wind Icon -->
        <path
          v-if="icon === 'wind'"
          d="M 3,8 Q 8,6 13,8 M 2,12 Q 7,10 12,12 Q 17,14 22,12 M 3,16 Q 8,14 13,16"
          stroke-width="2"
          stroke-linecap="round"
        />

        <!-- Droplet Icon -->
        <path
          v-else-if="icon === 'droplet'"
          d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Cloud Icon -->
        <path
          v-else-if="icon === 'cloud'"
          d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Thermometer Icon -->
        <path
          v-else-if="icon === 'thermometer'"
          d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Compass Icon -->
        <g v-else-if="icon === 'compass'">
          <circle cx="12" cy="12" r="10" stroke-width="2" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
        </g>
      </svg>
    </div>

    <div class="metric-content">
      <div class="metric-label">{{ label }}</div>
      <div class="metric-value">
        {{ value }}
        <span v-if="unit" class="metric-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: 'wind' | 'droplet' | 'cloud' | 'thermometer' | 'compass'
  label: string
  value: string | number
  unit?: string
}>()
</script>

<style scoped>
.metric-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-sm);
}

.metric-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  color: var(--color-info-solid);
}

.metric-icon svg {
  width: 100%;
  height: 100%;
}

.metric-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.metric-label {
  font-size: var(--font-size-11);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.metric-value {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.metric-unit {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  margin-left: var(--space-1);
}
</style>
