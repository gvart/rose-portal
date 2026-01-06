// Actuator API response types
export interface MetricNamesResponse {
  names: string[]
}

export interface MetricMeasurement {
  statistic: string  // 'VALUE', 'COUNT', 'TOTAL', 'MAX', etc.
  value: number
}

export interface MetricTag {
  tag: string
  values: string[]
}

export interface MetricResponse {
  name: string
  description?: string
  baseUnit?: string
  measurements: MetricMeasurement[]
  availableTags?: MetricTag[]
}

// UI-specific types
export interface MetricDisplayData {
  name: string
  value: number
  unit?: string
  description?: string
  statistic?: string
}

export interface MetricGroup {
  title: string
  metrics: MetricDisplayData[]
}

// Specific metric categories
export interface DiskMetrics {
  free: number
  total: number
  used: number
  usagePercent: number
}

export interface JvmMemoryMetrics {
  heap: number
  nonHeap: number
  total: number
}

export interface HikariMetrics {
  active: number
  idle: number
  total: number
  max: number
  min: number
}

export interface AiMetrics {
  activeOperations: number
  totalOperations: number
}
