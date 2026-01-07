// API Response Types (from backend)
export interface WeatherApiResponse {
  latitude: number
  longitude: number
  timezone: string
  hourlyForecast: HourlyForecastItem[]
  units: WeatherUnits
}

export interface HourlyForecastItem {
  time: string // ISO 8601
  temperature: number
  apparentTemperature: number
  windSpeed: number
  windDirection: number // 0-360 degrees
  windGusts: number
  precipitation: number // mm
  cloudCover: number // 0-100%
}

export interface WeatherUnits {
  temperature: string
  windSpeed: string
  precipitation: string
}

// Internal Weather Types (transformed)
export interface HourlyForecast {
  time: Date
  temperature: number
  apparentTemperature: number
  windSpeed: number
  windDirection: number
  windGusts: number
  precipitation: number
  cloudCover: number
  condition: WeatherCondition
  icon: WeatherIconType
}

export interface DailyForecast {
  date: Date
  dayName: string // "Mon", "Tue", etc.
  tempHigh: number
  tempLow: number
  condition: WeatherCondition
  icon: WeatherIconType
  precipitationChance: number // Percentage
  windSpeedMax: number
  hourlyData: HourlyForecast[]
}

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  condition: WeatherCondition
  icon: WeatherIconType
  windSpeed: number
  windDirection: number
  precipitation: number
  cloudCover: number
  time: Date
}

export interface WeatherLocation {
  latitude: number
  longitude: number
  name?: string
  timezone: string
}

export interface WeatherAlert {
  id: string
  type: 'high-wind' | 'heavy-rain' | 'extreme-heat' | 'extreme-cold' | 'storm'
  severity: 'low' | 'medium' | 'high' | 'extreme'
  title: string
  description: string
  threshold: number
  currentValue: number
}

// Weather Conditions
export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'light-rain'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'fog'
  | 'windy'

// Weather Icon Types
export type WeatherIconType =
  | 'sun'
  | 'sun-cloud'
  | 'cloud'
  | 'clouds'
  | 'rain'
  | 'heavy-rain'
  | 'wind'
  | 'fog'

// Geolocation Types
export interface GeolocationData {
  latitude: number
  longitude: number
  timestamp: number
}

export type PermissionState = 'prompt' | 'granted' | 'denied'

// Alert Thresholds
export const ALERT_THRESHOLDS = {
  WIND_MODERATE: 40, // km/h
  WIND_HIGH: 60,
  WIND_EXTREME: 80,
  RAIN_MODERATE: 10, // mm/hr
  RAIN_HEAVY: 20,
  RAIN_EXTREME: 40,
  TEMP_HOT: 35, // Celsius
  TEMP_VERY_HOT: 40,
  TEMP_COLD: -5,
  TEMP_VERY_COLD: -15
} as const
