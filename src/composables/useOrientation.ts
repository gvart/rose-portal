import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export type Orientation = 'portrait' | 'landscape'

export function useOrientation() {
  const orientation = ref<Orientation>('portrait')
  const isPortrait = computed(() => orientation.value === 'portrait')
  const isLandscape = computed(() => orientation.value === 'landscape')

  const updateOrientation = () => {
    const width = window.innerWidth
    const height = window.innerHeight

    // Only apply landscape mode on mobile/tablet devices (max width 1024px)
    // Desktop always uses portrait mode layout
    if (width <= 1024 && width > height) {
      orientation.value = 'landscape'
    } else {
      orientation.value = 'portrait'
    }
  }

  onMounted(() => {
    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateOrientation)
    window.removeEventListener('orientationchange', updateOrientation)
  })

  return {
    orientation,
    isPortrait,
    isLandscape
  }
}
