import { ref, computed } from 'vue'

const STORAGE_KEY = 'rose-portal-screensaver'

interface ScreensaverSettings {
  enabled: boolean
  timeout: number  // minutes
}

const DEFAULT_SETTINGS: ScreensaverSettings = {
  enabled: true,
  timeout: 5
}

// Load settings from localStorage
function loadSettings(): ScreensaverSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_SETTINGS.enabled,
        timeout: validateTimeout(parsed.timeout)
      }
    }
  } catch (error) {
    console.error('Failed to load screensaver settings:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

// Save settings to localStorage
function saveSettings(settings: ScreensaverSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save screensaver settings:', error)
  }
}

// Validate timeout value (1-60 minutes)
function validateTimeout(value: any): number {
  const num = Number(value)
  if (isNaN(num)) return DEFAULT_SETTINGS.timeout
  return Math.max(1, Math.min(60, Math.round(num)))
}

// Global reactive state
const settings = ref<ScreensaverSettings>(loadSettings())

/**
 * Composable for managing screensaver settings with localStorage persistence
 *
 * Features:
 * - Enable/disable screensaver
 * - Configurable timeout (1-60 minutes)
 * - Automatic localStorage persistence
 *
 * @example
 * const { isEnabled, timeoutMinutes, toggleEnabled, setTimeoutMinutes } = useScreensaverSettings()
 */
export function useScreensaverSettings() {
  const isEnabled = computed(() => settings.value.enabled)
  const timeoutMinutes = computed(() => settings.value.timeout)

  function toggleEnabled(): void {
    settings.value.enabled = !settings.value.enabled
    saveSettings(settings.value)
  }

  function setTimeoutMinutes(minutes: number): void {
    settings.value.timeout = validateTimeout(minutes)
    saveSettings(settings.value)
  }

  function setEnabled(enabled: boolean): void {
    settings.value.enabled = enabled
    saveSettings(settings.value)
  }

  return {
    isEnabled,
    timeoutMinutes,
    toggleEnabled,
    setTimeoutMinutes,
    setEnabled
  }
}
