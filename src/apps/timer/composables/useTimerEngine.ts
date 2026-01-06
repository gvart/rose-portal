import { watch, onMounted, onBeforeUnmount } from 'vue'
import type { Timer } from '../types/timer'
import type { useTimerStore } from '../stores/timerStore'

/**
 * Timer engine composable
 * Based on useClock.ts pattern but extended for multiple simultaneous timers
 * Updates every 100ms for smooth display
 */
export function useTimerEngine(store: ReturnType<typeof useTimerStore>) {
  let intervalId: number | null = null
  const TICK_INTERVAL = 100 // Update every 100ms for smooth display

  /**
   * Calculate elapsed time for a timer
   * Uses Date.now() instead of tick count to handle browser tab backgrounding
   */
  function calculateElapsed(timer: Timer, now: number): number {
    if (!timer.startedAt) return 0

    let elapsed = 0

    if (timer.pausedAt) {
      // Timer is paused - use pausedAt as end time
      elapsed = timer.pausedAt.getTime() - timer.startedAt.getTime()
    } else {
      // Timer is running - calculate from start to now
      elapsed = now - timer.startedAt.getTime()
    }

    return Math.max(0, elapsed)
  }

  /**
   * Check if timer should complete
   */
  function shouldComplete(timer: Timer, elapsed: number): boolean {
    // Stopwatch never auto-completes
    if (timer.type === 'stopwatch') {
      return false
    }

    // Countdown and Pomodoro complete when elapsed >= duration
    if (timer.type === 'countdown' || timer.type === 'pomodoro') {
      return elapsed >= timer.duration
    }

    return false
  }

  /**
   * Main tick function - updates all running timers
   */
  function tick() {
    const now = Date.now()

    store.timers
      .filter((t) => t.status === 'running')
      .forEach((timer) => {
        // Calculate elapsed time since startedAt
        const elapsed = calculateElapsed(timer, now)
        store.updateElapsed(timer.id, elapsed)

        // Check completion conditions
        if (shouldComplete(timer, elapsed)) {
          store.completeTimer(timer.id)
        }
      })
  }

  /**
   * Start the timer engine
   */
  function startEngine() {
    if (intervalId !== null) return
    intervalId = window.setInterval(tick, TICK_INTERVAL)
  }

  /**
   * Stop the timer engine
   */
  function stopEngine() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Auto-start/stop engine based on active timers
  watch(
    () => store.hasActiveTimers,
    (hasActive) => {
      if (hasActive) {
        startEngine()
      } else {
        stopEngine()
      }
    }
  )

  // Start engine on mount if there are active timers
  onMounted(() => {
    if (store.hasActiveTimers) {
      startEngine()
    }
  })

  // Clean up on unmount
  onBeforeUnmount(() => {
    stopEngine()
  })

  return {
    startEngine,
    stopEngine
  }
}
