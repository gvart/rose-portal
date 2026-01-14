import { ref, computed } from 'vue'

const BACKEND_URL_KEY = 'rose_backend_url'
const VOSK_URL_KEY = 'rose_vosk_url'
const PROJECT_KEY_KEY = 'rose_project_key'

function isProduction(): boolean {
  return import.meta.env.PROD
}

// Module-level refs (singleton) - shared across all components
const backendUrl = ref<string>(localStorage.getItem(BACKEND_URL_KEY) || '')
const voskUrl = ref<string>(localStorage.getItem(VOSK_URL_KEY) || '')
const projectKey = ref<string>(localStorage.getItem(PROJECT_KEY_KEY) || '')

export function useConfiguration() {

  function validateUrl(url: string): boolean {
    if (!url || url.trim() === '') return false
    const httpRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i
    const wsRegex = /^wss?:\/\/[^\s/$.?#].[^\s]*$/i
    return httpRegex.test(url) || wsRegex.test(url)
  }

  function setBackendUrl(url: string) {
    if (!validateUrl(url)) {
      throw new Error('Invalid backend URL format')
    }
    backendUrl.value = url
    localStorage.setItem(BACKEND_URL_KEY, url)
  }

  function setVoskUrl(url: string) {
    // Allow empty Vosk URL (optional)
    if (url.trim() !== '' && !validateUrl(url)) {
      throw new Error('Invalid Vosk URL format')
    }
    voskUrl.value = url
    if (url.trim() !== '') {
      localStorage.setItem(VOSK_URL_KEY, url)
    } else {
      localStorage.removeItem(VOSK_URL_KEY)
    }
  }

  function getBackendUrl(): string {
    if (isProduction()) {
      return 'https://api.rosehub.eu'
    }
    // Development mode: always use localhost
    return 'http://localhost:8080'
  }

  function getVoskUrl(): string | null {
    return voskUrl.value || null
  }

  function getProjectKey(): string | null {
    return projectKey.value || null
  }

  function setProjectKey(key: string) {
    console.log('[useConfiguration] Setting project key:', key)
    projectKey.value = key
    localStorage.setItem(PROJECT_KEY_KEY, key)
    console.log('[useConfiguration] Project key set. Current value:', projectKey.value)
  }

  function clearProjectKey() {
    projectKey.value = ''
    localStorage.removeItem(PROJECT_KEY_KEY)
  }

  function clearConfiguration() {
    backendUrl.value = ''
    voskUrl.value = ''
    localStorage.removeItem(BACKEND_URL_KEY)
    localStorage.removeItem(VOSK_URL_KEY)
    clearProjectKey()
  }

  const isConfigured = computed(() => {
    // Always configured (backend URL is hardcoded for both prod and dev)
    return true
  })

  return {
    backendUrl: computed(() => backendUrl.value),
    voskUrl: computed(() => voskUrl.value),
    projectKey: computed(() => projectKey.value),
    isConfigured,
    setBackendUrl,
    setVoskUrl,
    getBackendUrl,
    getVoskUrl,
    getProjectKey,
    setProjectKey,
    clearProjectKey,
    validateUrl,
    clearConfiguration
  }
}
