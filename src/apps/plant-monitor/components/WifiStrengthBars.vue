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
  if (status === 'good') return 'text-green-500'
  if (status === 'warning') return 'text-amber-500'
  return 'text-red-500'
})
</script>

<style scoped>
.wifi-bars {
  @apply flex items-end gap-0.5 h-4;
}

.bar {
  @apply w-1 bg-gray-300 rounded-sm transition-colors;
}

.bar-1 { height: 25%; }
.bar-2 { height: 50%; }
.bar-3 { height: 75%; }
.bar-4 { height: 100%; }

.bar.active {
  @apply bg-current;
}
</style>
