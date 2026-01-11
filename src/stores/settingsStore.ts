import { defineStore } from 'pinia'
import { useHapticFeedback } from '@/composables/useHapticFeedback'
import { useConfiguration } from '@/composables/useConfiguration'
import { useScreensaverSettings } from '@/composables/useScreensaverSettings'

export const useSettingsStore = defineStore('settings', () => {
  const haptic = useHapticFeedback()
  const config = useConfiguration()
  const screensaver = useScreensaverSettings()

  return {
    // Haptic feedback state
    hapticEnabled: haptic.isEnabled,
    hapticSupported: haptic.isSupported,

    // Haptic actions
    toggleHaptic: haptic.toggleHaptic,
    setHapticEnabled: haptic.setHapticEnabled,
    vibrate: haptic.vibrate,

    // Configuration state
    backendUrl: config.backendUrl,
    voskUrl: config.voskUrl,
    isConfigured: config.isConfigured,

    // Configuration actions
    setBackendUrl: config.setBackendUrl,
    setVoskUrl: config.setVoskUrl,
    clearConfiguration: config.clearConfiguration,

    // Screensaver state
    screensaverEnabled: screensaver.isEnabled,
    screensaverTimeout: screensaver.timeoutMinutes,

    // Screensaver actions
    toggleScreensaver: screensaver.toggleEnabled,
    setScreensaverTimeout: screensaver.setTimeoutMinutes
  }
})
