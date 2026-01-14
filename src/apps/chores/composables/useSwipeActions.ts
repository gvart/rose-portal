import { ref, type Ref } from 'vue'
import { useHapticFeedback } from '@/composables/useHapticFeedback'

export interface SwipeActionsOptions {
  thresholdLeft?: number // Default: 120px (reveal actions menu)
  thresholdRight?: number // Default: 80px (move to next column)
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  hapticEnabled?: boolean // Default: true
}

export interface SwipeDirection {
  type: 'left' | 'right' | null
}

export function useSwipeActions(
  containerRef: Ref<HTMLElement | null>,
  options: SwipeActionsOptions
) {
  const { vibrate } = useHapticFeedback()

  // Default values
  const thresholdLeft = options.thresholdLeft ?? 120
  const thresholdRight = options.thresholdRight ?? 80
  const hapticEnabled = options.hapticEnabled ?? true

  // State
  const swipeOffset = ref(0)
  const isActive = ref(false)
  const direction = ref<'left' | 'right' | null>(null)
  const isLocked = ref(false)

  // Touch tracking
  let startX = 0
  let startY = 0
  let startTime = 0
  let swipeDirectionDetermined = false
  let isVerticalScroll = false
  let hasTriggeredHaptic = false

  function handleTouchStart(event: TouchEvent): void {
    if (isLocked.value) return

    const touch = event.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    swipeDirectionDetermined = false
    isVerticalScroll = false
    hasTriggeredHaptic = false
    isActive.value = true
  }

  function handleTouchMove(event: TouchEvent): void {
    if (isLocked.value || !isActive.value) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    // Detect scroll intent on first significant movement
    if (!swipeDirectionDetermined) {
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absY > absX && absY > 10) {
        // Vertical scroll detected - disable card swipe
        isVerticalScroll = true
        isActive.value = false
        return
      } else if (absX > 20) {
        // Horizontal swipe detected - lock column scroll
        swipeDirectionDetermined = true
        event.preventDefault() // Prevent column scroll
      }
    }

    if (isVerticalScroll || !swipeDirectionDetermined) return

    // Prevent default to stop scrolling
    event.preventDefault()

    // Update swipe offset with elastic resistance beyond threshold
    let offset = deltaX
    const currentThreshold = deltaX > 0 ? thresholdRight : -thresholdLeft

    // Apply elastic resistance beyond threshold
    if (Math.abs(deltaX) > Math.abs(currentThreshold)) {
      const excess = Math.abs(deltaX) - Math.abs(currentThreshold)
      const resistance = 0.3 // 30% of normal speed beyond threshold
      offset = currentThreshold + (excess * resistance * Math.sign(deltaX))
    }

    swipeOffset.value = offset
    direction.value = offset > 0 ? 'right' : 'left'

    // Trigger haptic feedback when crossing threshold (once per swipe)
    if (hapticEnabled && !hasTriggeredHaptic) {
      if ((offset > 0 && offset >= thresholdRight) ||
          (offset < 0 && Math.abs(offset) >= thresholdLeft)) {
        vibrate('medium')
        hasTriggeredHaptic = true
      }
    }
  }

  function handleTouchEnd(event: TouchEvent): void {
    if (isLocked.value || !isActive.value || isVerticalScroll) {
      reset()
      return
    }

    const deltaX = swipeOffset.value
    const deltaY = Math.abs((event.changedTouches[0]?.clientY || 0) - startY)
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
    const duration = Date.now() - startTime
    const velocity = distance / duration * 1000 // px/s

    // Calculate swipe angle
    const angle = Math.atan2(deltaY, Math.abs(deltaX)) * (180 / Math.PI)

    // Validation: must be horizontal swipe (within ±30°), minimum distance, and velocity
    const isHorizontalSwipe = angle < 30 && Math.abs(deltaX) > 30
    const hasSufficientVelocity = velocity > 200 || Math.abs(deltaX) > thresholdRight

    if (isHorizontalSwipe && hasSufficientVelocity) {
      // Lock to prevent rapid swipes
      isLocked.value = true

      // Trigger appropriate action based on direction and threshold
      if (deltaX > 0 && deltaX >= thresholdRight && options.onSwipeRight) {
        // Right swipe - quick move to next column
        options.onSwipeRight()
        if (hapticEnabled) vibrate('light')
      } else if (deltaX < 0 && Math.abs(deltaX) >= thresholdLeft && options.onSwipeLeft) {
        // Left swipe - reveal actions menu
        options.onSwipeLeft()
        if (hapticEnabled) vibrate('light')
      }

      // Reset after animation completes (including cooldown)
      setTimeout(() => {
        reset()
        isLocked.value = false
      }, 500) // Animation duration + cooldown
    } else {
      // Snap back to original position
      reset()
    }
  }

  function reset(): void {
    swipeOffset.value = 0
    isActive.value = false
    direction.value = null
    swipeDirectionDetermined = false
    isVerticalScroll = false
    hasTriggeredHaptic = false
  }

  return {
    swipeOffset,
    isActive,
    direction,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    reset
  }
}
