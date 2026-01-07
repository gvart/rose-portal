import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  WeatherLocation,
  WeatherAlert
} from '../types/weather'
import type { ClothingRecommendationResponse } from '../types/clothing'
import { getWeatherForecast, getClothingRecommendation } from '../services/weatherApi'
import { detectWeatherAlerts } from '../composables/useWeatherAlerts'
import { useGeolocation } from '@/composables/useGeolocation'

const AUTO_REFRESH_INTERVAL = 30 * 60 * 1000 // 30 minutes

export const useWeatherStore = defineStore('weather', () => {
  // ============ State ============
  const currentWeather = ref<CurrentWeather | null>(null)
  const hourlyForecast = ref<HourlyForecast[]>([])
  const dailyForecast = ref<DailyForecast[]>([])
  const location = ref<WeatherLocation | null>(null)
  const alerts = ref<WeatherAlert[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastRefresh = ref<Date | null>(null)

  // Clothing recommendations state
  const clothingRecommendations = ref<ClothingRecommendationResponse | null>(null)
  const clothingLoading = ref(false)
  const clothingError = ref<string | null>(null)
  const clothingLastFetch = ref<Date | null>(null)

  let autoRefreshTimer: number | null = null

  // ============ Computed ============
  const hasData = computed(() => currentWeather.value !== null)

  const next24Hours = computed(() => {
    const now = new Date()
    return hourlyForecast.value.filter((h) => {
      const diffHours = (h.time.getTime() - now.getTime()) / (1000 * 60 * 60)
      return diffHours >= 0 && diffHours <= 24
    })
  })

  const hasActiveAlerts = computed(() => alerts.value.length > 0)

  const highSeverityAlerts = computed(() =>
    alerts.value.filter((a) => a.severity === 'high' || a.severity === 'extreme')
  )

  const hasClothingData = computed(() => clothingRecommendations.value !== null)

  const clothingButtonState = computed(() => {
    if (clothingLoading.value) return 'loading'
    if (clothingError.value) return 'error'
    if (hasClothingData.value) return 'ready'
    return 'idle'
  })

  // ============ Actions ============

  /**
   * Fetch weather for user's current location (using geolocation)
   */
  async function fetchWeatherForCurrentLocation(): Promise<boolean> {
    const geo = useGeolocation()
    const success = await geo.requestLocation()

    if (!success || !geo.location.value) {
      error.value = geo.error.value || 'Failed to get location'
      return false
    }

    return fetchWeather(geo.location.value.latitude, geo.location.value.longitude)
  }

  /**
   * Fetch weather for specific coordinates
   */
  async function fetchWeather(latitude: number, longitude: number): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const data = await getWeatherForecast(latitude, longitude)

      currentWeather.value = data.current
      hourlyForecast.value = data.hourly
      dailyForecast.value = data.daily
      location.value = data.location

      // Detect alerts
      alerts.value = detectWeatherAlerts(data.current, data.hourly)

      lastRefresh.value = new Date()

      // Fetch clothing recommendations in background (non-blocking)
      fetchClothingRecommendation(latitude, longitude).catch((err) => {
        console.error('Clothing recommendation fetch error:', err)
      })

      return true
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load weather'
      error.value = errorMessage
      console.error('Weather fetch error:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh weather data using last known location
   */
  async function refresh(): Promise<boolean> {
    if (!location.value) {
      return fetchWeatherForCurrentLocation()
    }

    return fetchWeather(location.value.latitude, location.value.longitude)
  }

  /**
   * Start auto-refresh timer
   */
  function startAutoRefresh(): void {
    stopAutoRefresh()
    autoRefreshTimer = window.setInterval(() => {
      refresh()
    }, AUTO_REFRESH_INTERVAL)
  }

  /**
   * Stop auto-refresh timer
   */
  function stopAutoRefresh(): void {
    if (autoRefreshTimer !== null) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
  }

  /**
   * Fetch clothing recommendation for specific coordinates
   */
  async function fetchClothingRecommendation(
    latitude: number,
    longitude: number
  ): Promise<boolean> {
    clothingLoading.value = true
    clothingError.value = null

    try {
      const data = await getClothingRecommendation(latitude, longitude)
      clothingRecommendations.value = data
      clothingLastFetch.value = new Date()
      return true
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load clothing recommendations'
      clothingError.value = errorMessage
      console.error('Clothing recommendation fetch error:', e)
      return false
    } finally {
      clothingLoading.value = false
    }
  }

  /**
   * Retry fetching clothing recommendation using last known location
   */
  async function retryClothingRecommendation(): Promise<boolean> {
    if (!location.value) {
      clothingError.value = 'Location not available'
      return false
    }

    return fetchClothingRecommendation(location.value.latitude, location.value.longitude)
  }

  /**
   * Clear clothing recommendation data
   */
  function clearClothingData(): void {
    clothingRecommendations.value = null
    clothingError.value = null
    clothingLastFetch.value = null
  }

  /**
   * Clear all weather data
   */
  function clearData(): void {
    currentWeather.value = null
    hourlyForecast.value = []
    dailyForecast.value = []
    location.value = null
    alerts.value = []
    error.value = null
    lastRefresh.value = null
    clearClothingData()
  }

  return {
    // State
    currentWeather,
    hourlyForecast,
    dailyForecast,
    location,
    alerts,
    loading,
    error,
    lastRefresh,

    // Clothing state
    clothingRecommendations,
    clothingLoading,
    clothingError,
    clothingLastFetch,

    // Computed
    hasData,
    next24Hours,
    hasActiveAlerts,
    highSeverityAlerts,
    hasClothingData,
    clothingButtonState,

    // Actions
    fetchWeatherForCurrentLocation,
    fetchWeather,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    clearData,

    // Clothing actions
    fetchClothingRecommendation,
    retryClothingRecommendation,
    clearClothingData
  }
})
