import { ref, computed } from 'vue'
import type { GeolocationData, PermissionState } from '@/apps/weather/types/weather'

const CACHE_KEY = 'weather:location'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export function useGeolocation() {
  const location = ref<GeolocationData | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  const permission = ref<PermissionState>('prompt')

  const isSupported = computed(() => 'geolocation' in navigator)

  /**
   * Get cached location from localStorage
   */
  function getCachedLocation(): GeolocationData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const data = JSON.parse(cached) as GeolocationData
      const age = Date.now() - data.timestamp

      // Check if cache is still valid
      if (age > CACHE_TTL) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return data
    } catch (err) {
      console.error('Failed to read cached location:', err)
      return null
    }
  }

  /**
   * Save location to localStorage cache
   */
  function cacheLocation(data: GeolocationData): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to cache location:', err)
    }
  }

  /**
   * Request location from browser
   */
  async function requestLocation(): Promise<boolean> {
    if (!isSupported.value) {
      error.value = 'Geolocation is not supported by your browser'
      return false
    }

    // Try cache first
    const cached = getCachedLocation()
    if (cached) {
      location.value = cached
      permission.value = 'granted'
      return true
    }

    // Request from browser
    loading.value = true
    error.value = null

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          }

          location.value = data
          permission.value = 'granted'
          cacheLocation(data)
          loading.value = false
          resolve(true)
        },
        (err) => {
          error.value = err.message
          permission.value = 'denied'
          loading.value = false
          resolve(false)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  /**
   * Clear cached location
   */
  function clearCache(): void {
    localStorage.removeItem(CACHE_KEY)
    location.value = null
  }

  return {
    location,
    error,
    loading,
    permission,
    isSupported,
    requestLocation,
    clearCache
  }
}
