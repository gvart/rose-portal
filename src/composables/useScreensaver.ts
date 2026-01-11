import { computed } from 'vue'
import { useScreensaverSettings } from './useScreensaverSettings'
import { useIdleDetection } from './useIdleDetection'
import { useHapticFeedback } from './useHapticFeedback'

/**
 * Main composable for screensaver functionality
 *
 * Orchestrates idle detection and screensaver activation based on user settings.
 * Combines useScreensaverSettings and useIdleDetection composables.
 *
 * Features:
 * - Automatic activation after configured idle time
 * - Haptic feedback on dismiss
 * - Theme-aware
 * - Respects enable/disable setting
 *
 * @returns Object with screensaver state and control functions
 *
 * @example
 * const { isActive, dismiss, settings } = useScreensaver()
 *
 * // In template:
 * <div v-if="isActive" @click="dismiss">Screensaver content</div>
 */
export function useScreensaver() {
  const settings = useScreensaverSettings()
  const { vibrate } = useHapticFeedback()

  // Convert minutes to milliseconds
  const timeoutMs = computed(() => settings.timeoutMinutes.value * 60 * 1000)

  const { isIdle, resetIdleTimer, stopTracking, startTracking, forceReset } = useIdleDetection({
    timeout: timeoutMs,
    enabled: settings.isEnabled,
    // Ignore activity events when screensaver is already showing
    shouldIgnoreActivity: () => settings.isEnabled.value && isIdle.value
  })

  // Screensaver is active when enabled AND user is idle
  const isActive = computed(() => settings.isEnabled.value && isIdle.value)

  /**
   * Dismiss the screensaver
   * Provides haptic feedback and resets the idle timer
   */
  function dismiss(): void {
    vibrate('light')
    resetIdleTimer()
  }

  return {
    isActive,
    dismiss,
    settings,
    stopIdleTracking: stopTracking,
    startIdleTracking: startTracking,
    forceResetIdle: forceReset
  }
}
