import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useHapticFeedback } from './useHapticFeedback'

export type SwipeDirection = 'left' | 'right'

export interface SwipeGestureOptions {
  direction?: SwipeDirection | 'both'
  threshold?: number        // Minimum swipe distance (px)
  maxVertical?: number      // Max vertical deviation (px)
  maxDuration?: number      // Max swipe duration (ms)
  edgeZone?: number | null  // Edge activation zone (px from left), null = anywhere
  onSwipe: (direction: SwipeDirection) => void
  hapticPattern?: 'light' | 'medium'
}

export function useSwipeGesture(
  elementRef: Ref<HTMLElement | null>,
  options: SwipeGestureOptions
) {
  const {
    direction = 'right',
    threshold = 80,
    maxVertical = 30,
    maxDuration = 500,
    edgeZone = 50,
    onSwipe,
    hapticPattern = 'medium'
  } = options

  const { vibrate } = useHapticFeedback()

  // Swipe state
  const swipeProgress = ref(0)
  const swipeDistance = ref(0)
  const isSwiping = ref(false)

  // Touch tracking
  let startX = 0
  let startY = 0
  let startTime = 0
  let currentX = 0
  let currentY = 0

  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return // Single finger only

    const touch = event.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    currentX = startX
    currentY = startY

    // Check edge zone if specified
    if (edgeZone !== null && startX > edgeZone) {
      return // Not in edge zone, ignore
    }

    isSwiping.value = false
    swipeProgress.value = 0
    swipeDistance.value = 0
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1) return

    const touch = event.touches[0]
    currentX = touch.clientX
    currentY = touch.clientY

    const deltaX = currentX - startX
    const deltaY = currentY - startY

    // Check if horizontal movement dominates (prevents scroll conflict)
    // Allow vertical scrolling unless horizontal movement is clearly dominant
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      return // Vertical movement dominates, likely scrolling
    }

    // Check vertical deviation
    if (Math.abs(deltaY) > maxVertical) {
      return // Too much vertical movement
    }

    // Check edge zone on start
    if (edgeZone !== null && startX > edgeZone) {
      return
    }

    // Valid swipe in progress
    isSwiping.value = true

    // Calculate progress (0-1)
    const absDistance = Math.abs(deltaX)
    const progress = Math.min(absDistance / threshold, 1)
    swipeProgress.value = progress
    swipeDistance.value = absDistance

    // Trigger light haptic at 90% threshold
    if (progress >= 0.9 && progress < 1) {
      vibrate('light')
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    if (!isSwiping.value) {
      reset()
      return
    }

    const deltaX = currentX - startX
    const deltaY = currentY - startY
    const duration = Date.now() - startTime

    // Validate swipe
    const isValidSwipe =
      Math.abs(deltaX) > threshold &&
      Math.abs(deltaY) < maxVertical &&
      duration < maxDuration

    if (isValidSwipe) {
      const swipeDir: SwipeDirection = deltaX > 0 ? 'right' : 'left'

      // Check if this direction is allowed
      if (direction === 'both' || direction === swipeDir) {
        // Trigger haptic feedback
        vibrate(hapticPattern)

        // Execute callback
        onSwipe(swipeDir)
      }
    }

    reset()
  }

  function handleTouchCancel() {
    reset()
  }

  function reset() {
    isSwiping.value = false
    swipeProgress.value = 0
    swipeDistance.value = 0
    startX = 0
    startY = 0
    currentX = 0
    currentY = 0
  }

  // Register listeners
  onMounted(() => {
    const element = elementRef.value
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
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
    swipeProgress,
    swipeDistance,
    isSwiping
  }
}
