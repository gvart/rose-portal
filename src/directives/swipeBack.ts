import { type Directive, type DirectiveBinding, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSwipeGesture } from '@/composables/useSwipeGesture'

interface SwipeBackElement extends HTMLElement {
  _swipeBackCleanup?: () => void
}

export const swipeBackDirective: Directive = {
  mounted(el: SwipeBackElement, binding: DirectiveBinding) {
    const router = useRouter()
    const elementRef = ref<HTMLElement | null>(el)

    // Get custom handler or use default router.back()
    const customHandler = typeof binding.value === 'function' ? binding.value : null
    const defaultHandler = () => {
      if (customHandler) {
        customHandler()
      } else {
        router.back()
      }
    }

    // Check modifiers
    const useEdgeZone = !binding.modifiers.anywhere

    // Setup swipe gesture
    const { swipeProgress } = useSwipeGesture(elementRef, {
      direction: 'right',
      threshold: 80,
      maxVertical: 30,
      maxDuration: 500,
      edgeZone: useEdgeZone ? 50 : null, // null = swipe from anywhere
      onSwipe: defaultHandler,
      hapticPattern: 'medium'
    })

    // Watch for swipe progress changes reactively (no polling needed)
    const stopWatch = watch(swipeProgress, (progress) => {
      if (progress > 0) {
        el.style.setProperty('--swipe-progress', progress.toString())
      } else {
        el.style.removeProperty('--swipe-progress')
      }
    })

    // Store cleanup function
    el._swipeBackCleanup = () => {
      stopWatch()
      elementRef.value = null
    }
  },

  unmounted(el: SwipeBackElement) {
    // Cleanup
    if (el._swipeBackCleanup) {
      el._swipeBackCleanup()
      delete el._swipeBackCleanup
    }
  }
}
