import type { StatusLevel } from '../types/plant'

export function getMoistureStatus(percent: number): StatusLevel {
  if (percent <= 20) return 'critical'
  if (percent <= 35) return 'warning'
  if (percent > 70) return 'saturated'
  return 'good'
}

export function getBatteryStatus(percent: number): StatusLevel {
  if (percent <= 10) return 'critical'
  if (percent <= 25) return 'warning'
  return 'good'
}

export function getWifiStatus(rssi: number): StatusLevel {
  if (rssi <= -76) return 'critical'
  if (rssi <= -75) return 'warning'
  return 'good'
}

export function getOverallHealth(moisture: number, battery: number): StatusLevel {
  const moistureStatus = getMoistureStatus(moisture)
  const batteryStatus = getBatteryStatus(battery)

  if (moistureStatus === 'critical' || batteryStatus === 'critical') {
    return 'critical'
  }
  if (moistureStatus === 'warning' || batteryStatus === 'warning') {
    return 'warning'
  }
  return moistureStatus
}

export function getMoistureMessage(percent: number): string {
  if (percent <= 20) return 'Needs water now!'
  if (percent <= 35) return 'Water soon'
  if (percent > 70) return 'Recently watered'
  return 'Optimal moisture'
}

export function getWifiLabel(rssi: number): string {
  if (rssi >= -50) return 'Excellent'
  if (rssi >= -65) return 'Good'
  if (rssi >= -75) return 'Fair'
  return 'Weak'
}

export function getWifiBars(rssi: number): number {
  if (rssi >= -50) return 4
  if (rssi >= -65) return 3
  if (rssi >= -75) return 2
  return 1
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
