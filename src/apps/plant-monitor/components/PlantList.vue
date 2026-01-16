<template>
  <div ref="containerRef" class="plant-list">
    <!-- Pull-to-refresh indicator -->
    <PullIndicator :state="pullState" :distance="pullDistance" :progress="pullProgress" />

    <div class="plant-list__content">
      <div class="plant-list__header">
        <p v-if="lastRefresh" class="plant-list__last-refresh">
          Last updated: {{ formatTime(lastRefresh) }}
        </p>
        <q-btn
          :label="loading ? 'Refreshing...' : 'Refresh Now'"
          color="positive"
          unelevated
          @click="refresh"
          :loading="loading"
          :disable="loading"
        />
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
  width: 100%;
  position: relative;
}

.plant-list__content {
  width: 100%;
}

.plant-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background: var(--color-bg-primary);
  border: var(--depth-1-border);
  border-radius: var(--radius-md);
}

.plant-list__last-refresh {
  color: var(--color-text-secondary);
  font-size: var(--font-size-13);
}

.plant-list__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .plant-list__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .plant-list__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
