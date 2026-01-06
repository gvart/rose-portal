<template>
  <AppLayout title="System Monitor" theme-color="#3b82f6">
    <div ref="containerRef" class="system-monitor">
      <!-- Pull-to-refresh indicator -->
      <PullIndicator :state="pullState" :distance="pullDistance" :progress="pullProgress" />

      <div class="system-monitor__content">
        <LoadingSpinner v-if="loading && !lastRefresh" message="Loading metrics..." />

        <ErrorMessage
          v-else-if="error"
          :message="error"
          @retry="store.fetchMetrics()"
        />

        <MetricGrid v-else>
          <DiskMetrics v-if="store.metricsAvailable.disk" :metrics="store.disk" />
          <JvmMetrics v-if="store.metricsAvailable.jvm" :metrics="store.jvmMemory" />
          <HikariMetrics v-if="store.metricsAvailable.hikari" :metrics="store.hikari" />
          <AiMetrics v-if="store.metricsAvailable.ai" :metrics="store.aiMetrics" />

          <div v-if="!hasAnyMetrics" class="no-metrics-message">
            <p class="text-gray-600">No metrics available. Check actuator endpoints.</p>
          </div>
        </MetricGrid>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import PullIndicator from '@/components/common/PullIndicator.vue'
import MetricGrid from './components/MetricGrid.vue'
import DiskMetrics from './components/DiskMetrics.vue'
import JvmMetrics from './components/JvmMetrics.vue'
import HikariMetrics from './components/HikariMetrics.vue'
import AiMetrics from './components/AiMetrics.vue'
import { useSystemMonitorStore } from './stores/systemMonitorStore'
import { usePullToRefresh } from '@/composables/usePullToRefresh'

const store = useSystemMonitorStore()

const loading = computed(() => store.loading)
const error = computed(() => store.error)
const lastRefresh = computed(() => store.lastRefresh)

const hasAnyMetrics = computed(() => {
  return store.metricsAvailable.disk ||
         store.metricsAvailable.jvm ||
         store.metricsAvailable.hikari ||
         store.metricsAvailable.ai
})

// Pull-to-refresh setup
const containerRef = ref<HTMLElement | null>(null)
const { pullState, pullDistance, pullProgress } = usePullToRefresh(containerRef, {
  threshold: 50,
  resistance: 1.5,
  maxPull: 100,
  onRefresh: async () => {
    await store.fetchMetrics()
  },
  hapticOnTrigger: true
})

function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}

onMounted(() => {
  store.startAutoRefresh(5000)
})

onUnmounted(() => {
  store.stopAutoRefresh()
})
</script>

<style scoped>
.system-monitor {
  @apply w-full relative;
}

.system-monitor__content {
  @apply w-full;
}

.no-metrics-message {
  @apply col-span-full flex items-center justify-center p-8
         bg-yellow-50 border-2 border-yellow-200 rounded-xl;
}

.no-metrics-message p {
  @apply text-lg font-medium;
}
</style>
