import { computed } from 'vue'

/**
 * Detects if the application is running as an installed PWA
 * (Progressive Web App) in standalone or fullscreen mode.
 *
 * @returns {Object} Object containing isPWA computed property
 */
export function usePwaDetection() {
  const isPWA = computed(() => {
    // Check display-mode media queries (modern approach)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches

    // Check iOS standalone flag (fallback for older Safari)
    const isIosStandalone = (window.navigator as any).standalone === true

    return isStandalone || isFullscreen || isIosStandalone
  })

  return { isPWA }
}
