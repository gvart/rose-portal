import { ref, watch, onUnmounted } from 'vue'

export interface UseAutoSaveOptions {
  delay?: number // milliseconds
  onSave: () => void | Promise<void>
  enabled?: boolean
}

/**
 * Composable for auto-saving with debounce
 * Triggers save after specified delay of inactivity
 */
export function useAutoSave(options: UseAutoSaveOptions) {
  const { delay = 3000, onSave, enabled = true } = options

  const isSaving = ref(false)
  const lastSaved = ref<Date | null>(null)
  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Schedule a save after the delay period
   */
  function scheduleSave() {
    if (!enabled) return

    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }

    // Schedule new save
    saveTimeout = setTimeout(async () => {
      await executeSave()
    }, delay)
  }

  /**
   * Execute the save operation
   */
  async function executeSave() {
    if (isSaving.value || !enabled) return

    isSaving.value = true
    try {
      await onSave()
      lastSaved.value = new Date()
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Cancel any pending save
   */
  function cancelSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }
  }

  /**
   * Immediately save (bypassing delay)
   */
  async function saveNow() {
    cancelSave()
    await executeSave()
  }

  // Clean up on unmount
  onUnmounted(() => {
    cancelSave()
  })

  return {
    isSaving,
    lastSaved,
    scheduleSave,
    saveNow,
    cancelSave
  }
}
