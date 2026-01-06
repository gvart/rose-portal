import { ref, computed } from 'vue'

const BACKEND_URL_KEY = 'rose_backend_url'
const VOSK_URL_KEY = 'rose_vosk_url'

export function useConfiguration() {
  const backendUrl = ref<string>(localStorage.getItem(BACKEND_URL_KEY) || '')
  const voskUrl = ref<string>(localStorage.getItem(VOSK_URL_KEY) || '')

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
    if (!validateUrl(url)) {
      throw new Error('Invalid Vosk URL format')
    }
    voskUrl.value = url
    localStorage.setItem(VOSK_URL_KEY, url)
  }

  function getBackendUrl(): string {
    return backendUrl.value
  }

  function getVoskUrl(): string | null {
    return voskUrl.value || null
  }

  function clearConfiguration() {
    backendUrl.value = ''
    voskUrl.value = ''
    localStorage.removeItem(BACKEND_URL_KEY)
    localStorage.removeItem(VOSK_URL_KEY)
  }

  const isConfigured = computed(() => {
    return backendUrl.value !== '' && voskUrl.value !== ''
  })

  return {
    backendUrl: computed(() => backendUrl.value),
    voskUrl: computed(() => voskUrl.value),
    isConfigured,
    setBackendUrl,
    setVoskUrl,
    getBackendUrl,
    getVoskUrl,
    validateUrl,
    clearConfiguration
  }
}
