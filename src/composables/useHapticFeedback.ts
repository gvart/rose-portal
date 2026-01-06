import { ref, computed } from 'vue'

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'strong'

const STORAGE_KEY = 'rose-portal-settings'

// Vibration durations in milliseconds - iOS-style intensity levels
const PATTERNS: Record<HapticPattern, number> = {
  light: 10,   // Subtle feedback for taps and navigation
  medium: 20,  // Standard button presses and selections
  heavy: 50,   // Important actions and confirmations
  strong: 50   // Alias for heavy (backwards compatibility)
}

// Check if Vibration API is supported
const isSupported = computed(() => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
})

// Load haptic preference from localStorage
function loadHapticPreference(): boolean {
  if (typeof localStorage === 'undefined') return true

  try {
    const settings = localStorage.getItem(STORAGE_KEY)
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.hapticEnabled ?? true
    }
  } catch (e) {
    console.warn('Failed to load haptic settings:', e)
  }

  // Default: enabled if supported
  return isSupported.value
}

// Save haptic preference to localStorage
function saveHapticPreference(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return

  try {
    const settings = { hapticEnabled: enabled }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.warn('Failed to save haptic settings:', e)
  }
}

// Global reactive state for haptic preference
const isEnabled = ref(loadHapticPreference())

export function useHapticFeedback() {
  /**
   * Trigger haptic feedback with the specified pattern
   */
  function vibrate(pattern: HapticPattern = 'light'): void {
    // Check if haptics are supported and enabled
    if (!isSupported.value || !isEnabled.value) {
      return
    }

    const duration = PATTERNS[pattern]

    try {
      navigator.vibrate(duration)
    } catch (e) {
      // Silently fail - don't break the UI
      console.warn('Vibration failed:', e)
    }
  }

  /**
   * Toggle haptic feedback on/off
   */
  function toggleHaptic(): void {
    isEnabled.value = !isEnabled.value
    saveHapticPreference(isEnabled.value)

    // Provide immediate feedback when enabling
    if (isEnabled.value) {
      vibrate('medium')
    }
  }

  /**
   * Set haptic enabled state
   */
  function setHapticEnabled(enabled: boolean): void {
    isEnabled.value = enabled
    saveHapticPreference(enabled)
  }

  return {
    vibrate,
    toggleHaptic,
    setHapticEnabled,
    isSupported,
    isEnabled
  }
}
