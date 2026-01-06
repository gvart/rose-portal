import { useConfiguration } from '@/composables/useConfiguration'

export function getApiBaseUrl(): string {
  // Both development and production use configured URL from localStorage
  // Configure your backend URL in Settings → Backend Configuration
  const { getBackendUrl } = useConfiguration()
  const configuredUrl = getBackendUrl()

  return configuredUrl || ''
}

export const API_TIMEOUT = 30000
