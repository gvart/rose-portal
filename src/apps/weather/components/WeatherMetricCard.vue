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
  @apply flex items-center gap-3 p-3 bg-white/80 rounded-lg;
}

.metric-icon {
  @apply flex-shrink-0 w-10 h-10 text-blue-500;
}

.metric-icon svg {
  @apply w-full h-full;
}

.metric-content {
  @apply flex flex-col min-w-0;
}

.metric-label {
  @apply text-xs text-gray-600 font-medium;
}

.metric-value {
  @apply text-lg font-bold text-gray-900 tabular-nums;
  font-variant-numeric: tabular-nums;
}

.metric-unit {
  @apply text-sm font-normal text-gray-600 ml-1;
}
</style>
