import { ref } from 'vue'

const shouldShowUserSelection = ref(false)

export function useAuthFlow() {
  function triggerUserSelection(): void {
    shouldShowUserSelection.value = true
  }

  function clearUserSelection(): void {
    shouldShowUserSelection.value = false
  }

  return {
    shouldShowUserSelection,
    triggerUserSelection,
    clearUserSelection
  }
}
