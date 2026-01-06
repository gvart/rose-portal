<template>
  <div ref="containerRef" class="plant-list">
    <!-- Pull-to-refresh indicator -->
    <PullIndicator :state="pullState" :distance="pullDistance" :progress="pullProgress" />

    <div class="plant-list__content">
      <div class="plant-list__header">
        <p v-if="lastRefresh" class="plant-list__last-refresh">
          Last updated: {{ formatTime(lastRefresh) }}
        </p>
        <button v-haptic @click="refresh" :disabled="loading" class="plant-list__refresh-btn">
          {{ loading ? 'Refreshing...' : 'Refresh Now' }}
        </button>
      </div>

      <!-- Loading skeletons on first load -->
      <div v-if="loading && !lastRefresh" class="plant-list__grid">
        <PlantCardSkeleton v-for="i in 3" :key="`skeleton-${i}`" />
      </div>

      <ErrorMessage v-else-if="error" :message="error" @retry="refresh" />

      <EmptyState
        v-else-if="plants.length === 0"
        icon="plant"
        title="No Plants Yet"
        description="Connect your first plant sensor to get started monitoring soil moisture and battery levels"
      />

      <div v-else class="plant-list__grid">
        <PlantCard v-for="plant in plants" :key="plant.deviceId" :plant="plant" @select="onSelectPlant" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Plant } from '../types/plant'
import PlantCard from './PlantCard.vue'
import PlantCardSkeleton from './PlantCardSkeleton.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import PullIndicator from '@/components/common/PullIndicator.vue'
import { usePullToRefresh } from '@/composables/usePullToRefresh'

const props = defineProps<{
  plants: Plant[]
  loading: boolean
  error: string | null
  lastRefresh: Date | null
}>()

const emit = defineEmits<{ refresh: [] }>()

const router = useRouter()

// Pull-to-refresh setup
const containerRef = ref<HTMLElement | null>(null)
const { pullState, pullDistance, pullProgress } = usePullToRefresh(containerRef, {
  threshold: 50,
  resistance: 1.5,
  maxPull: 100,
  onRefresh: async () => {
    refresh()
    // Wait for loading to complete (simple approach)
    await new Promise(resolve => {
      const checkLoading = setInterval(() => {
        if (!props.loading) {
          clearInterval(checkLoading)
          resolve(undefined)
        }
      }, 100)
    })
  },
  hapticOnTrigger: true
})

function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}

function refresh() {
  emit('refresh')
}

function onSelectPlant(deviceId: string) {
  router.push(`/plant-monitor/${deviceId}`)
}
</script>

<style scoped>
.plant-list {
  @apply w-full relative;
}

.plant-list__content {
  @apply w-full;
}

.plant-list__header {
  @apply flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow;
}

.plant-list__last-refresh {
  @apply text-gray-600 text-sm;
}

.plant-list__refresh-btn {
  @apply btn-touch bg-green-600 text-white rounded-lg
         hover:bg-green-700 transition-colors duration-200
         disabled:bg-gray-400 disabled:cursor-not-allowed;
}

.plant-list__grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}
</style>
