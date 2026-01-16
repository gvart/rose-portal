import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useScrollIndicator(containerRef: Ref<HTMLElement | null>) {
  const canScrollUp = ref(false)
  const canScrollDown = ref(false)

  const checkScroll = () => {
    const container = containerRef.value
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container

    canScrollUp.value = scrollTop > 10
    canScrollDown.value = scrollTop + clientHeight < scrollHeight - 10
  }

  let observer: ResizeObserver | null = null

  onMounted(() => {
    const container = containerRef.value
    if (!container) return

    container.addEventListener('scroll', checkScroll, { passive: true })

    // Also check on resize
    observer = new ResizeObserver(checkScroll)
    observer.observe(container)

    // Initial check
    checkScroll()
  })

  onUnmounted(() => {
    const container = containerRef.value
    if (container) {
      container.removeEventListener('scroll', checkScroll)
    }
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    canScrollUp,
    canScrollDown,
    checkScroll
  }
}
