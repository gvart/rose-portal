import type { WeatherCondition, WeatherIconType } from '../types/weather'

interface WeatherMetrics {
  cloudCover: number
  precipitation: number
  windSpeed: number
}

/**
 * Determine weather condition from metrics
 * Priority: precipitation > wind > cloudCover
 */
export function determineCondition(metrics: WeatherMetrics): WeatherCondition {
  const { precipitation, windSpeed, cloudCover } = metrics

  // Precipitation takes priority
  if (precipitation > 15) return 'heavy-rain'
  if (precipitation > 5) return 'rain'
  if (precipitation > 1) return 'light-rain'

  // Wind conditions
  if (windSpeed > 50) return 'windy'

  // Cloud cover
  if (cloudCover < 20) return 'clear'
  if (cloudCover < 60) return 'partly-cloudy'
  if (cloudCover < 80) return 'cloudy'

  return 'overcast'
}

/**
 * Map weather condition to icon type
 */
export function determineIcon(condition: WeatherCondition): WeatherIconType {
  const iconMap: Record<WeatherCondition, WeatherIconType> = {
    clear: 'sun',
    'partly-cloudy': 'sun-cloud',
    cloudy: 'cloud',
    overcast: 'clouds',
    'light-rain': 'rain',
    rain: 'rain',
    'heavy-rain': 'heavy-rain',
    snow: 'rain', // Reuse rain icon for now
    fog: 'fog',
    windy: 'wind'
  }

  return iconMap[condition]
}

/**
 * Get wind direction label from degrees
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(((degrees % 360) / 45)) % 8
  return directions[index]
}

/**
 * Format temperature with degree symbol
 */
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°`
}

/**
 * Format precipitation amount
 */
export function formatPrecipitation(mm: number): string {
  if (mm < 0.1) return '0 mm'
  if (mm < 1) return `${mm.toFixed(1)} mm`
  return `${Math.round(mm)} mm`
}
