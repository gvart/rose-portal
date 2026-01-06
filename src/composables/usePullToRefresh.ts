import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useHapticFeedback } from './useHapticFeedback'

export type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'complete'

export interface PullToRefreshOptions {
  threshold?: number        // Pull distance to trigger refresh (px)
  resistance?: number       // Pull resistance factor (higher = harder to pull)
  maxPull?: number         // Maximum pull distance (px)
  onRefresh: () => Promise<void>
  hapticOnTrigger?: boolean
}

export function usePullToRefresh(
  elementRef: Ref<HTMLElement | null>,
  options: PullToRefreshOptions
) {
  const {
    threshold = 80,
    resistance = 2.5,
    maxPull = 120,
    onRefresh,
    hapticOnTrigger = true
  } = options

  const { vibrate } = useHapticFeedback()

  // Pull state
  const pullState = ref<PullState>('idle')
  const pullDistance = ref(0)
  const pullProgress = ref(0)

  // Touch tracking
  let startY = 0
  let currentY = 0
  let scrollElement: HTMLElement | null = null
  let isRefreshing = false
  let hasTriggeredReady = false

  // Apply resistance curve for natural feel
  function applyResistance(distance: number): number {
    const resistedDistance = distance / (1 + (distance / 100) * resistance)
    return Math.min(resistedDistance, maxPull)
  }

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return // Single finger only
    if (isRefreshing) return // Don't allow pull during refresh

    const element = elementRef.value
    if (!element) return

    // Check if at scroll top - check both element and document scroll
    const elementScrollTop = element.scrollTop
    const documentScrollTop = window.scrollY || document.documentElement.scrollTop || 0
    const scrollTop = Math.max(elementScrollTop, documentScrollTop)

    if (scrollTop !== 0) return // Not at top, ignore

    const touch = event.touches[0]
    startY = touch.clientY
    currentY = startY
    scrollElement = element
    hasTriggeredReady = false

    pullState.value = 'idle'
    pullDistance.value = 0
    pullProgress.value = 0
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1) return
    if (isRefreshing) return

    const touch = event.touches[0]
    currentY = touch.clientY

    const rawPull = currentY - startY

    // If not pulling down or no scroll element, allow normal scroll
    if (rawPull <= 0 || !scrollElement) {
      resetPull()
      return
    }

    // Check if still at scroll top - check both element and document scroll
    const elementScrollTop = scrollElement.scrollTop
    const documentScrollTop = window.scrollY || document.documentElement.scrollTop || 0
    const scrollTop = Math.max(elementScrollTop, documentScrollTop)

    if (scrollTop !== 0) {
      resetPull()
      return
    }

    // Only prevent default if we're actually pulling (at top and pulling down)
    // This allows normal scrolling when not at the top
    event.preventDefault()

    // Calculate pull distance with resistance
    const resistedPull = applyResistance(rawPull)
    pullDistance.value = resistedPull

    // Calculate progress (0-1)
    const progress = Math.min(resistedPull / threshold, 1)
    pullProgress.value = progress

    // Update state based on progress
    if (progress >= 1 && pullState.value !== 'ready') {
      pullState.value = 'ready'

      // Trigger haptic feedback when threshold reached
      if (hapticOnTrigger && !hasTriggeredReady) {
        vibrate('light')
        hasTriggeredReady = true
      }
    } else if (progress < 1 && pullState.value === 'ready') {
      pullState.value = 'pulling'
      hasTriggeredReady = false
    } else if (progress > 0 && pullState.value === 'idle') {
      pullState.value = 'pulling'
    }
  }

  async function handleTouchEnd(event: TouchEvent) {
    if (isRefreshing) return
    if (!scrollElement) return

    const shouldRefresh = pullState.value === 'ready' && pullProgress.value >= 1

    if (shouldRefresh) {
      // Trigger refresh
      pullState.value = 'refreshing'
      isRefreshing = true

      // Trigger haptic feedback on refresh trigger
      if (hapticOnTrigger) {
        vibrate('medium')
      }

      try {
        await onRefresh()

        // Show complete state briefly
        pullState.value = 'complete'
        pullDistance.value = threshold // Keep at threshold for complete animation

        // Return to idle after animation
        setTimeout(() => {
          reset()
        }, 500)
      } catch (error) {
        reset()
      } finally {
        isRefreshing = false
      }
    } else {
      // Not enough pull, reset
      reset()
    }

    scrollElement = null
  }

  function handleTouchCancel() {
    reset()
    scrollElement = null
  }

  function resetPull() {
    if (pullState.value === 'idle') return

    pullState.value = 'idle'
    pullDistance.value = 0
    pullProgress.value = 0
  }

  function reset() {
    pullState.value = 'idle'
    pullDistance.value = 0
    pullProgress.value = 0
    startY = 0
    currentY = 0
    hasTriggeredReady = false
  }

  // Register listeners
  onMounted(() => {
    const element = elementRef.value
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false }) // Not passive - need preventDefault
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true })
  })

  // Cleanup listeners
  onUnmounted(() => {
    const element = elementRef.value
    if (!element) return

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('touchcancel', handleTouchCancel)
  })

  return {
    pullState,
    pullDistance,
    pullProgress
  }
}
