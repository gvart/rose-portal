import { useConfiguration } from '@/composables/useConfiguration'

export function getApiBaseUrl(): string {
  // Development: always use empty string to utilize Vite proxy
  // This avoids mixed content errors (HTTPS dev server + HTTP backend)
  if (!import.meta.env.PROD) {
    return ''
  }

  // Production: use configured URL from localStorage
  const { getBackendUrl } = useConfiguration()
  const configuredUrl = getBackendUrl()

  return configuredUrl || ''
}

export const API_TIMEOUT = 30000
