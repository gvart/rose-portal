export interface PlantStatistics {
  moistureRaw: number
  moisturePercent: number
  batteryPercent: number
  batteryVoltage: number
  wateringCount: number
  uptimeSeconds: number
  wifiRssi: number
}

export interface PlantConfig {
  dryThreshold: number
  wetThreshold: number
  pumpDuration: number
  publishInterval: number
  displayDimEnabled: boolean
  displayDimTimeout: number
}

export interface Plant {
  deviceId: string
  name: string
  createdAt: string
  updatedAt: string
  statistics: PlantStatistics
  config: PlantConfig
}

export type StatusLevel = 'good' | 'warning' | 'critical' | 'saturated'

// Sensor calibration constants
export const SENSOR_CALIBRATION = {
  DRY_RAW: 3450,   // 0% moisture
  WET_RAW: 1700    // 100% moisture
} as const

export const CONFIG_LIMITS = {
  // Thresholds now in percentage (0-100%)
  dryThreshold: { min: 0, max: 100, step: 5, default: 20 },      // Default ~20% (was 2800 raw)
  wetThreshold: { min: 0, max: 100, step: 5, default: 60 },      // Default ~60% (was 2000 raw)
  pumpDuration: { min: 500, max: 10000, step: 100, default: 3000 },
  publishInterval: { min: 5000, max: 300000, step: 5000, default: 30000 },
  displayDimTimeout: { min: 5000, max: 300000, step: 5000, default: 30000 }
} as const

// Safe operating range (15% to 85%)
export const SAFE_THRESHOLD_RANGE = {
  MIN: 15,
  MAX: 85
} as const

// Conversion functions
export function rawToPercentage(raw: number): number {
  const { DRY_RAW, WET_RAW } = SENSOR_CALIBRATION
  return Math.round(((DRY_RAW - raw) / (DRY_RAW - WET_RAW)) * 100)
}

export function percentageToRaw(percentage: number): number {
  const { DRY_RAW, WET_RAW } = SENSOR_CALIBRATION
  return Math.round(DRY_RAW - (percentage * (DRY_RAW - WET_RAW) / 100))
}

export interface ConfigValidationError {
  field: string
  message: string
}
