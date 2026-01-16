<template>
  <q-card class="metric-card" flat>
    <q-card-section horizontal class="items-center q-pa-sm">
      <q-icon :name="iconName" size="40px" color="info" class="metric-icon" />

      <q-card-section class="metric-content">
        <div class="metric-label">{{ label }}</div>
        <div class="metric-value">
          {{ value }}
          <span v-if="unit" class="metric-unit">{{ unit }}</span>
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: 'wind' | 'droplet' | 'cloud' | 'thermometer' | 'compass'
  label: string
  value: string | number
  unit?: string
}>()

const iconName = computed(() => {
  const iconMap = {
    wind: 'air',
    droplet: 'water_drop',
    cloud: 'cloud',
    thermometer: 'thermostat',
    compass: 'explore'
  }
  return iconMap[props.icon]
})
</script>

<style scoped>
.metric-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-sm);
}

.metric-icon {
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
  padding: 0 !important;
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
