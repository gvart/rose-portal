import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Clock composable providing reactive current time
 * Updates every second with proper lifecycle management
 */
export function useClock() {
  const currentTime = ref(new Date())
  let intervalId: number | null = null

  const updateTime = () => {
    currentTime.value = new Date()
  }

  onMounted(() => {
    updateTime() // Initialize immediately
    intervalId = window.setInterval(updateTime, 1000)
  })

  onBeforeUnmount(() => {
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  })

  return {
    currentTime
  }
}
