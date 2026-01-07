import { apiClients } from '@/services/apiClient'
import type {
  WeatherApiResponse,
  HourlyForecast,
  DailyForecast,
  CurrentWeather,
  WeatherLocation
} from '../types/weather'
import type { ClothingRecommendationResponse } from '../types/clothing'
import { determineCondition, determineIcon } from '../utils/weatherConditions'

const api = apiClients.weather

interface WeatherForecastResult {
  current: CurrentWeather
  hourly: HourlyForecast[]
  daily: DailyForecast[]
  location: WeatherLocation
}

/**
 * Fetch weather forecast for given coordinates
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecastResult> {
  const response = await api.get<WeatherApiResponse>('/forecast', {
    params: { latitude, longitude }
  })

  const data = response.data

  // Transform hourly forecast
  const hourly = transformHourlyForecast(data.hourlyForecast)

  // Aggregate daily forecast
  const daily = aggregateDailyForecast(hourly)

  // Extract current weather (first hour)
  const current = extractCurrentWeather(hourly[0])

  // Build location info
  const location: WeatherLocation = {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone
  }

  return { current, hourly, daily, location }
}

/**
 * Transform API hourly forecast to internal format
 */
function transformHourlyForecast(apiHourly: WeatherApiResponse['hourlyForecast']): HourlyForecast[] {
  return apiHourly.map((item) => {
    const condition = determineCondition({
      cloudCover: item.cloudCover,
      precipitation: item.precipitation,
      windSpeed: item.windSpeed
    })

    const icon = determineIcon(condition)

    return {
      time: new Date(item.time),
      temperature: item.temperature,
      apparentTemperature: item.apparentTemperature,
      windSpeed: item.windSpeed,
      windDirection: item.windDirection,
      windGusts: item.windGusts,
      precipitation: item.precipitation,
      cloudCover: item.cloudCover,
      condition,
      icon
    }
  })
}

/**
 * Aggregate hourly data into daily forecast
 */
function aggregateDailyForecast(hourly: HourlyForecast[]): DailyForecast[] {
  const dailyMap = new Map<string, HourlyForecast[]>()

  // Group hourly data by date
  hourly.forEach((hour) => {
    const dateKey = hour.time.toISOString().split('T')[0]
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, [])
    }
    dailyMap.get(dateKey)!.push(hour)
  })

  // Build daily forecast objects
  const dailyForecasts = Array.from(dailyMap.entries()).map(([dateKey, hours]) => {
    const date = new Date(dateKey)

    // Calculate temperature range
    const temps = hours.map((h) => h.temperature)
    const tempHigh = Math.max(...temps)
    const tempLow = Math.min(...temps)

    // Use midday (12:00) condition as representative, or closest available
    const middayHour = hours.find((h) => h.time.getHours() === 12) || hours[Math.floor(hours.length / 2)]
    const condition = middayHour.condition
    const icon = middayHour.icon

    // Calculate precipitation chance (percentage of hours with precipitation)
    const hoursWithPrecip = hours.filter((h) => h.precipitation > 0.1).length
    const precipitationChance = (hoursWithPrecip / hours.length) * 100

    // Get max wind speed for the day
    const windSpeedMax = Math.max(...hours.map((h) => h.windSpeed))

    // Get day name
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)

    return {
      date,
      dayName,
      tempHigh,
      tempLow,
      condition,
      icon,
      precipitationChance,
      windSpeedMax,
      hourlyData: hours
    }
  })

  // Return first 7 days
  return dailyForecasts.slice(0, 7)
}

/**
 * Extract current weather from first hourly item
 */
function extractCurrentWeather(firstHour: HourlyForecast): CurrentWeather {
  return {
    temperature: firstHour.temperature,
    apparentTemperature: firstHour.apparentTemperature,
    condition: firstHour.condition,
    icon: firstHour.icon,
    windSpeed: firstHour.windSpeed,
    windDirection: firstHour.windDirection,
    precipitation: firstHour.precipitation,
    cloudCover: firstHour.cloudCover,
    time: firstHour.time
  }
}

/**
 * Fetch clothing recommendation for given coordinates
 */
export async function getClothingRecommendation(
  latitude: number,
  longitude: number
): Promise<ClothingRecommendationResponse> {
  const response = await api.get<ClothingRecommendationResponse>('/clothing-recommendation', {
    params: { latitude, longitude }
  })
  return response.data
}
