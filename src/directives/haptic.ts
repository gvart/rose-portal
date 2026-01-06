import type { Directive, DirectiveBinding } from 'vue'
import { useHapticFeedback, type HapticPattern } from '@/composables/useHapticFeedback'

const { vibrate } = useHapticFeedback()

interface HapticElement extends HTMLElement {
  __hapticHandler?: (event: Event) => void
}

/**
 * Vue directive for adding haptic feedback to elements
 *
 * Usage:
 * - v-haptic              // Default light vibration (10ms) on click
 * - v-haptic:medium       // Medium vibration (20ms) on click
 * - v-haptic:heavy        // Heavy vibration (50ms) on click - iOS-style intensity
 * - v-haptic:strong       // Strong vibration (50ms) - alias for heavy
 * - v-haptic.touchstart   // Trigger on touchstart instead of click
 */
export const hapticDirective: Directive = {
  mounted(el: HapticElement, binding: DirectiveBinding) {
    // Determine the haptic pattern (light, medium, strong)
    const pattern: HapticPattern = (binding.arg as HapticPattern) || 'light'

    // Determine which event to listen to
    const event = binding.modifiers.touchstart ? 'touchstart' : 'click'

    // Create the event handler
    const handler = () => {
      vibrate(pattern)
    }

    // Store the handler for cleanup
    el.__hapticHandler = handler

    // Add the event listener
    el.addEventListener(event, handler, { passive: true })
  },

  unmounted(el: HapticElement) {
    // Clean up event listener
    if (el.__hapticHandler) {
      el.removeEventListener('click', el.__hapticHandler)
      el.removeEventListener('touchstart', el.__hapticHandler)
      delete el.__hapticHandler
    }
  }
}
