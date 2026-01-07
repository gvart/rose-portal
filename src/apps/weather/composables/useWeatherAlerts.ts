import type { WeatherAlert, CurrentWeather, HourlyForecast } from '../types/weather'
import { ALERT_THRESHOLDS } from '../types/weather'

/**
 * Detect weather alerts from current conditions and hourly forecast
 */
export function detectWeatherAlerts(
  current: CurrentWeather,
  hourly: HourlyForecast[]
): WeatherAlert[] {
  const alerts: WeatherAlert[] = []

  // Check current conditions
  checkWindAlerts(current, alerts)
  checkPrecipitationAlerts(current, alerts)
  checkTemperatureAlerts(current, alerts)

  // Check upcoming hours (next 6 hours)
  const upcomingHours = hourly.slice(0, 6)
  checkUpcomingAlerts(upcomingHours, alerts)

  return alerts
}

/**
 * Check for wind-related alerts
 */
function checkWindAlerts(current: CurrentWeather, alerts: WeatherAlert[]): void {
  if (current.windSpeed >= ALERT_THRESHOLDS.WIND_EXTREME) {
    alerts.push({
      id: 'wind-extreme',
      type: 'high-wind',
      severity: 'extreme',
      title: 'Extreme Wind Warning',
      description: `Wind speeds reaching ${Math.round(current.windSpeed)} km/h. Stay indoors and secure loose objects.`,
      threshold: ALERT_THRESHOLDS.WIND_EXTREME,
      currentValue: current.windSpeed
    })
  } else if (current.windSpeed >= ALERT_THRESHOLDS.WIND_HIGH) {
    alerts.push({
      id: 'wind-high',
      type: 'high-wind',
      severity: 'high',
      title: 'High Wind Warning',
      description: `Strong winds of ${Math.round(current.windSpeed)} km/h. Exercise caution outdoors.`,
      threshold: ALERT_THRESHOLDS.WIND_HIGH,
      currentValue: current.windSpeed
    })
  } else if (current.windSpeed >= ALERT_THRESHOLDS.WIND_MODERATE) {
    alerts.push({
      id: 'wind-moderate',
      type: 'high-wind',
      severity: 'medium',
      title: 'Moderate Wind Advisory',
      description: `Winds of ${Math.round(current.windSpeed)} km/h. Secure loose outdoor items.`,
      threshold: ALERT_THRESHOLDS.WIND_MODERATE,
      currentValue: current.windSpeed
    })
  }
}

/**
 * Check for precipitation-related alerts
 */
function checkPrecipitationAlerts(current: CurrentWeather, alerts: WeatherAlert[]): void {
  if (current.precipitation >= ALERT_THRESHOLDS.RAIN_EXTREME) {
    alerts.push({
      id: 'rain-extreme',
      type: 'heavy-rain',
      severity: 'extreme',
      title: 'Extreme Rainfall Warning',
      description: `Heavy rainfall of ${current.precipitation.toFixed(1)} mm/hr. Flash flooding possible.`,
      threshold: ALERT_THRESHOLDS.RAIN_EXTREME,
      currentValue: current.precipitation
    })
  } else if (current.precipitation >= ALERT_THRESHOLDS.RAIN_HEAVY) {
    alerts.push({
      id: 'rain-heavy',
      type: 'heavy-rain',
      severity: 'high',
      title: 'Heavy Rain Warning',
      description: `Heavy rain of ${current.precipitation.toFixed(1)} mm/hr. Avoid travel if possible.`,
      threshold: ALERT_THRESHOLDS.RAIN_HEAVY,
      currentValue: current.precipitation
    })
  } else if (current.precipitation >= ALERT_THRESHOLDS.RAIN_MODERATE) {
    alerts.push({
      id: 'rain-moderate',
      type: 'heavy-rain',
      severity: 'medium',
      title: 'Moderate Rain Advisory',
      description: `Moderate rainfall of ${current.precipitation.toFixed(1)} mm/hr. Expect wet conditions.`,
      threshold: ALERT_THRESHOLDS.RAIN_MODERATE,
      currentValue: current.precipitation
    })
  }
}

/**
 * Check for temperature-related alerts
 */
function checkTemperatureAlerts(current: CurrentWeather, alerts: WeatherAlert[]): void {
  // Extreme heat
  if (current.temperature >= ALERT_THRESHOLDS.TEMP_VERY_HOT) {
    alerts.push({
      id: 'temp-extreme-hot',
      type: 'extreme-heat',
      severity: 'extreme',
      title: 'Extreme Heat Warning',
      description: `Dangerous heat of ${Math.round(current.temperature)}°C. Stay hydrated and avoid prolonged sun exposure.`,
      threshold: ALERT_THRESHOLDS.TEMP_VERY_HOT,
      currentValue: current.temperature
    })
  } else if (current.temperature >= ALERT_THRESHOLDS.TEMP_HOT) {
    alerts.push({
      id: 'temp-hot',
      type: 'extreme-heat',
      severity: 'high',
      title: 'High Temperature Warning',
      description: `Very hot conditions at ${Math.round(current.temperature)}°C. Limit outdoor activities.`,
      threshold: ALERT_THRESHOLDS.TEMP_HOT,
      currentValue: current.temperature
    })
  }

  // Extreme cold
  if (current.temperature <= ALERT_THRESHOLDS.TEMP_VERY_COLD) {
    alerts.push({
      id: 'temp-extreme-cold',
      type: 'extreme-cold',
      severity: 'extreme',
      title: 'Extreme Cold Warning',
      description: `Dangerous cold of ${Math.round(current.temperature)}°C. Risk of frostbite and hypothermia.`,
      threshold: ALERT_THRESHOLDS.TEMP_VERY_COLD,
      currentValue: current.temperature
    })
  } else if (current.temperature <= ALERT_THRESHOLDS.TEMP_COLD) {
    alerts.push({
      id: 'temp-cold',
      type: 'extreme-cold',
      severity: 'high',
      title: 'Low Temperature Warning',
      description: `Very cold at ${Math.round(current.temperature)}°C. Dress warmly.`,
      threshold: ALERT_THRESHOLDS.TEMP_COLD,
      currentValue: current.temperature
    })
  }
}

/**
 * Check upcoming hours for potential alerts
 */
function checkUpcomingAlerts(upcomingHours: HourlyForecast[], alerts: WeatherAlert[]): void {
  // Check if any extreme conditions are coming in next 6 hours
  const maxWind = Math.max(...upcomingHours.map((h) => h.windSpeed))
  const maxPrecip = Math.max(...upcomingHours.map((h) => h.precipitation))

  if (maxWind >= ALERT_THRESHOLDS.WIND_HIGH && !alerts.some((a) => a.type === 'high-wind')) {
    alerts.push({
      id: 'wind-upcoming',
      type: 'high-wind',
      severity: 'medium',
      title: 'Incoming High Winds',
      description: `Strong winds of ${Math.round(maxWind)} km/h expected in the next few hours.`,
      threshold: ALERT_THRESHOLDS.WIND_HIGH,
      currentValue: maxWind
    })
  }

  if (maxPrecip >= ALERT_THRESHOLDS.RAIN_HEAVY && !alerts.some((a) => a.type === 'heavy-rain')) {
    alerts.push({
      id: 'rain-upcoming',
      type: 'heavy-rain',
      severity: 'medium',
      title: 'Incoming Heavy Rain',
      description: `Heavy rainfall of ${maxPrecip.toFixed(1)} mm/hr expected in the next few hours.`,
      threshold: ALERT_THRESHOLDS.RAIN_HEAVY,
      currentValue: maxPrecip
    })
  }
}
