import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMetric, getMetricWithTags } from '../services/actuatorApi'
import type {
  DiskMetrics,
  JvmMemoryMetrics,
  HikariMetrics,
  AiMetrics,
  MetricResponse
} from '../types'

export const useSystemMonitorStore = defineStore('systemMonitor', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastRefresh = ref<Date | null>(null)

  // Raw metric data
  const diskFree = ref<number>(0)
  const diskTotal = ref<number>(0)
  const jvmHeapUsed = ref<number>(0)
  const jvmNonHeapUsed = ref<number>(0)
  const hikariActive = ref<number>(0)
  const hikariIdle = ref<number>(0)
  const hikariTotal = ref<number>(0)
  const hikariMax = ref<number>(0)
  const hikariMin = ref<number>(0)
  const aiActiveOps = ref<number>(0)
  const aiTotalOps = ref<number>(0)

  // Metric availability tracking
  const metricsAvailable = ref({
    disk: false,
    jvm: false,
    hikari: false,
    ai: false
  })

  // Auto-refresh timer
  let refreshTimer: number | null = null

  // Computed - Disk metrics
  const disk = computed<DiskMetrics>(() => ({
    free: diskFree.value,
    total: diskTotal.value,
    used: diskTotal.value - diskFree.value,
    usagePercent: diskTotal.value > 0
      ? ((diskTotal.value - diskFree.value) / diskTotal.value) * 100
      : 0
  }))

  // Computed - JVM metrics
  const jvmMemory = computed<JvmMemoryMetrics>(() => ({
    heap: jvmHeapUsed.value,
    nonHeap: jvmNonHeapUsed.value,
    total: jvmHeapUsed.value + jvmNonHeapUsed.value
  }))

  // Computed - Hikari metrics
  const hikari = computed<HikariMetrics>(() => ({
    active: hikariActive.value,
    idle: hikariIdle.value,
    total: hikariTotal.value,
    max: hikariMax.value,
    min: hikariMin.value
  }))

  // Computed - AI metrics
  const aiMetrics = computed<AiMetrics>(() => ({
    activeOperations: aiActiveOps.value,
    totalOperations: aiTotalOps.value
  }))

  // Helper to extract VALUE measurement
  function extractValue(metric: MetricResponse | null, statistic = 'VALUE'): number {
    if (!metric) return 0
    const measurement = metric.measurements.find(m => m.statistic === statistic)
    return measurement?.value ?? 0
  }

  // Actions
  async function fetchMetrics() {
    loading.value = true
    error.value = null

    try {
      // Fetch all metrics in parallel, handling 404s gracefully
      const [
        diskFreeMetric,
        diskTotalMetric,
        heapMetric,
        nonHeapMetric,
        activeConn,
        idleConn,
        totalConn,
        maxConn,
        minConn,
        aiActive,
        aiTotal
      ] = await Promise.all([
        getMetric('disk.free'),
        getMetric('disk.total'),
        getMetricWithTags('jvm.memory.used', { area: 'heap' }),
        getMetricWithTags('jvm.memory.used', { area: 'nonheap' }),
        getMetric('hikaricp.connections.active'),
        getMetric('hikaricp.connections.idle'),
        getMetric('hikaricp.connections'),
        getMetric('hikaricp.connections.max'),
        getMetric('hikaricp.connections.min'),
        getMetric('gen_ai.client.operation.active'),
        getMetric('gen_ai.client.operation')
      ])

      // Update values (extractValue handles null gracefully)
      diskFree.value = extractValue(diskFreeMetric)
      diskTotal.value = extractValue(diskTotalMetric)
      jvmHeapUsed.value = extractValue(heapMetric)
      jvmNonHeapUsed.value = extractValue(nonHeapMetric)
      hikariActive.value = extractValue(activeConn)
      hikariIdle.value = extractValue(idleConn)
      hikariTotal.value = extractValue(totalConn)
      hikariMax.value = extractValue(maxConn)
      hikariMin.value = extractValue(minConn)
      aiActiveOps.value = extractValue(aiActive, 'ACTIVE_TASKS')
      aiTotalOps.value = extractValue(aiTotal, 'COUNT')

      // Track which metric groups are available
      metricsAvailable.value = {
        disk: diskFreeMetric !== null || diskTotalMetric !== null,
        jvm: heapMetric !== null || nonHeapMetric !== null,
        hikari: activeConn !== null || totalConn !== null,
        ai: aiActive !== null || aiTotal !== null
      }

      lastRefresh.value = new Date()
    } catch (e) {
      // Only show errors for actual failures (not 404s)
      error.value = e instanceof Error ? e.message : 'Failed to fetch metrics'
      console.error('Metrics fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  function startAutoRefresh(intervalMs = 5000) {
    stopAutoRefresh()
    fetchMetrics()
    refreshTimer = window.setInterval(fetchMetrics, intervalMs)
  }

  function stopAutoRefresh() {
    if (refreshTimer !== null) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  return {
    // State
    loading,
    error,
    lastRefresh,
    metricsAvailable,

    // Computed
    disk,
    jvmMemory,
    hikari,
    aiMetrics,

    // Actions
    fetchMetrics,
    startAutoRefresh,
    stopAutoRefresh
  }
})
