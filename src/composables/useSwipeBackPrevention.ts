import { onMounted, onBeforeUnmount } from 'vue'
import { usePwaDetection } from './usePwaDetection'

/**
 * Global swipe-back gesture prevention for iOS Safari PWA.
 * Prevents Safari's native back navigation on edge swipes.
 *
 * This composable uses capture phase event listeners to intercept
 * touch events at the window level before they reach other handlers.
 * It only activates in PWA mode (standalone/fullscreen).
 *
 * @returns {Object} Object containing isPWA computed property
 */
export function useSwipeBackPrevention() {
  const { isPWA } = usePwaDetection()

  // Edge detection threshold (10% of screen width)
  const EDGE_THRESHOLD = 0.1

  function handleTouchStart(event: TouchEvent) {
    // Only prevent in PWA mode
    if (!isPWA.value) return

    // Only prevent single-finger touches
    if (event.touches.length !== 1) return

    const touch = event.touches[0]
    const screenWidth = window.innerWidth

    // Detect if touch started near left edge (back gesture zone)
    if (touch.clientX < screenWidth * EDGE_THRESHOLD) {
      // Prevent Safari's swipe-back gesture
      event.preventDefault()
    }
  }

  function handleTouchMove(event: TouchEvent) {
    // Additional prevention during move for Safari
    if (!isPWA.value) return

    if (event.touches.length === 1) {
      const touch = event.touches[0]
      const screenWidth = window.innerWidth

      // Continue preventing if still in edge zone
      if (touch.clientX < screenWidth * EDGE_THRESHOLD) {
        event.preventDefault()
      }
    }
  }

  onMounted(() => {
    if (isPWA.value) {
      // Use passive: false to allow preventDefault
      // Use capture: true to intercept before other handlers
      const options = { passive: false, capture: true }

      window.addEventListener('touchstart', handleTouchStart, options)
      window.addEventListener('touchmove', handleTouchMove, options)
    }
  })

  onBeforeUnmount(() => {
    if (isPWA.value) {
      const options = { capture: true }

      window.removeEventListener('touchstart', handleTouchStart, options)
      window.removeEventListener('touchmove', handleTouchMove, options)
    }
  })

  return { isPWA }
}
