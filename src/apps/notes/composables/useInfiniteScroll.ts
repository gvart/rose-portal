import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface InfiniteScrollOptions {
  threshold?: number // Distance from bottom to trigger (px)
  onLoadMore: () => void | Promise<void>
}

/**
 * Composable for infinite scroll detection
 * @param containerRef - Ref to scrollable container element
 * @param options - Configuration options
 * @returns isLoading state
 */
export function useInfiniteScroll(
  containerRef: Ref<HTMLElement | null>,
  options: InfiniteScrollOptions
) {
  const { threshold = 200, onLoadMore } = options
  const isLoading = ref(false)

  const handleScroll = async () => {
    if (!containerRef.value || isLoading.value) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.value
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    if (distanceFromBottom < threshold) {
      isLoading.value = true
      try {
        await onLoadMore()
      } finally {
        isLoading.value = false
      }
    }
  }

  onMounted(() => {
    containerRef.value?.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('scroll', handleScroll)
  })

  return { isLoading }
}
