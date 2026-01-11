import { ref, computed, onMounted, onBeforeUnmount, type ComputedRef } from 'vue'

export interface IdleDetectionOptions {
  timeout: ComputedRef<number>    // milliseconds until idle
  enabled: ComputedRef<boolean>   // can be disabled
  shouldIgnoreActivity?: () => boolean  // optional callback to ignore activity events
}

// Global reactive state
const isIdle = ref(false)
const lastActivityTime = ref(Date.now())

// Activity tracking state
let activityCheckInterval: number | null = null
let eventListeners: Array<{ event: string; handler: EventListener }> = []

// Events that indicate user activity
const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keypress',
  'touchstart',
  'scroll',
  'click'
]

// Throttle helper to avoid performance issues
function throttle(func: Function, wait: number): EventListener {
  let timeout: number | null = null
  return ((...args: any[]) => {
    if (!timeout) {
      timeout = window.setTimeout(() => {
        func(...args)
        timeout = null
      }, wait)
    }
  }) as EventListener
}

/**
 * Composable for detecting user inactivity
 *
 * Tracks mouse, keyboard, touch, and scroll events to determine
 * when the user has been idle for a specified duration.
 *
 * Features:
 * - Throttled event handlers (100ms) for performance
 * - Configurable timeout duration
 * - Can be enabled/disabled
 * - Automatic cleanup on unmount
 *
 * @param options - Configuration options
 * @returns Object with idle state and control functions
 *
 * @example
 * const { isIdle, resetIdleTimer } = useIdleDetection({
 *   timeout: computed(() => 5 * 60 * 1000),  // 5 minutes
 *   enabled: computed(() => true)
 * })
 */
export function useIdleDetection(options: IdleDetectionOptions) {
  const { timeout, enabled, shouldIgnoreActivity } = options

  // Reset the idle timer when user activity detected
  function resetIdleTimer(): void {
    // Check if we should ignore activity (e.g., when screensaver is showing)
    const shouldIgnore = shouldIgnoreActivity && shouldIgnoreActivity()

    if (shouldIgnore) {
      return
    }

    lastActivityTime.value = Date.now()
    if (isIdle.value) {
      isIdle.value = false
    }
  }

  // Throttled version for event handlers
  const throttledResetTimer = throttle(resetIdleTimer, 100)

  // Check if user has been idle
  function checkIdleStatus(): void {
    if (!enabled.value) {
      if (isIdle.value) {
        isIdle.value = false
      }
      return
    }

    const now = Date.now()
    const timeSinceActivity = now - lastActivityTime.value

    if (timeSinceActivity >= timeout.value) {
      if (!isIdle.value) {
        isIdle.value = true
      }
    }
  }

  // Start tracking user activity
  function startTracking(): void {
    if (eventListeners.length > 0) {
      // Already tracking
      return
    }

    // Setup event listeners
    ACTIVITY_EVENTS.forEach(eventName => {
      const handler = throttledResetTimer
      eventListeners.push({ event: eventName, handler })
      window.addEventListener(eventName, handler, { passive: true })
    })

    // Start interval check (every second)
    if (activityCheckInterval === null) {
      activityCheckInterval = window.setInterval(checkIdleStatus, 1000)
    }

    // Reset timer on start
    resetIdleTimer()
  }

  // Stop tracking user activity
  function stopTracking(): void {
    // Remove event listeners
    eventListeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler)
    })
    eventListeners = []

    // Clear interval
    if (activityCheckInterval !== null) {
      clearInterval(activityCheckInterval)
      activityCheckInterval = null
    }

    // DO NOT reset isIdle state - leave it as is so screensaver stays active
  }

  // Pause detection when tab is hidden (performance optimization)
  function handleVisibilityChange(): void {
    if (document.hidden) {
      // Tab hidden - reset timer to avoid triggering while in background
      resetIdleTimer()
    }
  }

  // Setup lifecycle hooks
  onMounted(() => {
    startTracking()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    stopTracking()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    isIdle: computed(() => isIdle.value),
    lastActivityTime: computed(() => lastActivityTime.value),
    resetIdleTimer,
    startTracking,
    stopTracking,
    // Force reset isIdle (bypasses shouldIgnoreActivity check)
    forceReset: () => {
      isIdle.value = false
      lastActivityTime.value = Date.now()
    }
  }
}
