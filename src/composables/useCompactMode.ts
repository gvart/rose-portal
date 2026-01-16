import { ref, watch, computed, onMounted } from 'vue'
import { useDeviceDetection } from './useDeviceDetection'

const STORAGE_KEY = 'rose-compact-mode'

// Global state
const isCompact = ref(false)
const pi5ForceApplied = ref(false)

export function useCompactMode() {
  const { isPi5 } = useDeviceDetection()

  // Initialize from localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) {
    isCompact.value = JSON.parse(stored)
    updateBodyClass(isCompact.value)
  }

  // Force compact mode on Pi5 (after mount to ensure device detection runs)
  onMounted(() => {
    if (isPi5.value && !isCompact.value && !pi5ForceApplied.value) {
      console.log('[Compact Mode] Forcing compact mode on Pi5')
      isCompact.value = true
      pi5ForceApplied.value = true
    }
  })

  // Toggle function
  const toggleCompact = () => {
    isCompact.value = !isCompact.value
  }

  // Set explicitly
  const setCompact = (value: boolean) => {
    isCompact.value = value
  }

  // Watch for changes and persist
  watch(isCompact, (newValue) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
    updateBodyClass(newValue)
  })

  return {
    isCompact: computed(() => isCompact.value),
    toggleCompact,
    setCompact
  }
}

function updateBodyClass(isCompact: boolean) {
  if (isCompact) {
    document.body.classList.add('compact')
  } else {
    document.body.classList.remove('compact')
  }
}
