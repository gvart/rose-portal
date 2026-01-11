<template>
  <div class="wifi-bars" :class="statusClass">
    <div class="bar bar-1" :class="{ active: bars >= 1 }"></div>
    <div class="bar bar-2" :class="{ active: bars >= 2 }"></div>
    <div class="bar bar-3" :class="{ active: bars >= 3 }"></div>
    <div class="bar bar-4" :class="{ active: bars >= 4 }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getWifiBars, getWifiStatus } from '../composables/usePlantStatus'

const props = defineProps<{ rssi: number }>()

const bars = computed(() => getWifiBars(props.rssi))

const statusClass = computed(() => {
  const status = getWifiStatus(props.rssi)
  if (status === 'good') return 'wifi-good'
  if (status === 'warning') return 'wifi-warning'
  return 'wifi-critical'
})
</script>

<style scoped>
.wifi-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.wifi-good { color: var(--color-success-solid); }
.wifi-warning { color: var(--color-warning-solid); }
.wifi-critical { color: var(--color-error-solid); }

.bar {
  width: var(--space-1);
  background: var(--color-border-secondary);
  border-radius: var(--radius-xs);
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.bar-1 { height: 25%; }
.bar-2 { height: 50%; }
.bar-3 { height: 75%; }
.bar-4 { height: 100%; }

.bar.active {
  background: currentColor;
}
</style>
