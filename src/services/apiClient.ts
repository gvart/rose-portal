/**
 * Unified API Client Factory
 *
 * Creates axios instances with shared configuration, error handling,
 * and request deduplication to improve performance and consistency.
 */

import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getApiBaseUrl, API_TIMEOUT } from '@/config/api'
import { useAuthStore } from '@/stores/authStore'
import { useAuthFlow } from '@/composables/useAuthFlow'

// ============================================================================
// Request Deduplication
// ============================================================================

interface PendingRequest {
  key: string
  controller: AbortController
}

const pendingRequests = new Map<string, PendingRequest>()

/**
 * Generate a unique key for request deduplication
 */
function generateRequestKey(config: InternalAxiosRequestConfig): string {
  const { method, url, params, data } = config
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
}

/**
 * Add request to pending map and return abort controller
 */
function addPendingRequest(config: InternalAxiosRequestConfig): AbortController | null {
  const key = generateRequestKey(config)

  // If duplicate request exists, abort the previous one
  if (pendingRequests.has(key)) {
    const existing = pendingRequests.get(key)!
    existing.controller.abort('Duplicate request')
    pendingRequests.delete(key)
  }

  // Create new abort controller
  const controller = new AbortController()
  pendingRequests.set(key, { key, controller })

  return controller
}

/**
 * Remove request from pending map
 */
function removePendingRequest(config: InternalAxiosRequestConfig): void {
  const key = generateRequestKey(config)
  pendingRequests.delete(key)
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Custom API error class with enhanced error details
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Transform axios error to user-friendly message
 */
function handleApiError(error: AxiosError): ApiError {
  const statusCode = error.response?.status
  const endpoint = error.config?.url

  let message = 'An error occurred while communicating with the server'

  if (!error.response) {
    message = 'Network error. Please check your connection.'
  } else if (statusCode === 400) {
    message = 'Invalid request data'
  } else if (statusCode === 401) {
    message = 'Unauthorized access'
  } else if (statusCode === 403) {
    message = 'Access forbidden'
  } else if (statusCode === 404) {
    message = 'Resource not found'
  } else if (statusCode === 408) {
    message = 'Request timeout. Please try again.'
  } else if (statusCode === 429) {
    message = 'Too many requests. Please slow down.'
  } else if (statusCode && statusCode >= 500) {
    message = 'Server error. Please try again later.'
  }

  return new ApiError(message, statusCode, endpoint, error)
}

// ============================================================================
// API Client Factory
// ============================================================================

export interface ApiClientOptions {
  basePath?: string
  timeout?: number
  enableDeduplication?: boolean
  enableErrorHandling?: boolean
}

/**
 * Create a configured axios instance with shared interceptors
 *
 * @param options - Configuration options
 * @returns Configured axios instance
 */
export function createApiClient(options: ApiClientOptions = {}): AxiosInstance {
  const {
    basePath = '',
    timeout = API_TIMEOUT,
    enableDeduplication = true,
    enableErrorHandling = true
  } = options

  // Determine base URL based on path
  const baseURL = basePath
    ? `${getApiBaseUrl()}${basePath}`
    : getApiBaseUrl()

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  // Request interceptor for deduplication
  if (enableDeduplication) {
    client.interceptors.request.use(
      (config) => {
        const controller = addPendingRequest(config)
        if (controller) {
          config.signal = controller.signal
        }
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  // Request interceptor for JWT authentication
  client.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor for cleanup and error handling
  client.interceptors.response.use(
    (response) => {
      if (enableDeduplication) {
        removePendingRequest(response.config)
      }
      return response
    },
    (error: AxiosError) => {
      if (enableDeduplication && error.config) {
        removePendingRequest(error.config)
      }

      // Handle request cancellation (not an error)
      if (axios.isCancel(error) || error.message === 'Duplicate request') {
        return Promise.reject(error)
      }

      // Handle 401 Unauthorized - token expired or invalid
      if (error.response?.status === 401) {
        const authStore = useAuthStore()
        if (authStore.token) {
          // User was authenticated but token is now invalid
          authStore.logout()

          // Trigger user selection modal
          const { triggerUserSelection } = useAuthFlow()
          triggerUserSelection()
        }
      }

      // Transform error if error handling is enabled
      if (enableErrorHandling && axios.isAxiosError(error)) {
        return Promise.reject(handleApiError(error))
      }

      return Promise.reject(error)
    }
  )

  return client
}

// ============================================================================
// Pre-configured API Clients
// ============================================================================

/**
 * Shared API clients for common endpoints
 */
export const apiClients = {
  /** Plants API - /api/v1/plants */
  plants: createApiClient({ basePath: '/api/v1' }),

  /** Calendar API - /api/v1/calendar */
  calendar: createApiClient({ basePath: '/api/v1/calendar' }),

  /** Recipe API - /api/v1/recipe */
  recipe: createApiClient({ basePath: '' }),

  /** Weather API - /api/v1/weather */
  weather: createApiClient({ basePath: '/api/v1/weather' }),

  /** Notes API - /api/v1 */
  notes: createApiClient({ basePath: '/api/v1' }),

  /** Chores API - /api/v1/chores */
  chores: createApiClient({ basePath: '/api/v1/chores' }),

  /** System Monitor API - /actuator */
  actuator: createApiClient({
    basePath: '/actuator',
    timeout: 5000,
    enableErrorHandling: false // Actuator has custom error handling
  })
}
