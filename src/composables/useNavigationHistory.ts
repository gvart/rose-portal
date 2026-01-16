/**
 * Navigation History Tracker for PWA
 * Provides reliable back navigation in PWA standalone mode where browser history may be limited
 */

interface HistoryEntry {
  path: string
  timestamp: number
}

export function useNavigationHistory() {
  const STORAGE_KEY = 'app-navigation-history'
  const MAX_HISTORY = 10

  /**
   * Get navigation history from sessionStorage
   */
  function getHistory(): HistoryEntry[] {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to parse navigation history:', error)
      return []
    }
  }

  /**
   * Add a route to navigation history
   */
  function addToHistory(path: string): void {
    try {
      const history = getHistory()

      // Don't add if it's the same as the last entry
      if (history.length > 0 && history[history.length - 1].path === path) {
        return
      }

      history.push({ path, timestamp: Date.now() })

      // Keep only last MAX_HISTORY entries
      if (history.length > MAX_HISTORY) {
        history.shift()
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to save navigation history:', error)
    }
  }

  /**
   * Check if we can go back in history
   */
  function canGoBack(): boolean {
    return getHistory().length > 1
  }

  /**
   * Get the parent route for the current path
   * Falls back to home if no parent can be determined
   */
  function getParentRoute(currentPath: string): string {
    // Fallback routes for each app section
    const fallbacks: Record<string, string> = {
      '/calendar': '/',
      '/chores': '/',
      '/plant-monitor': '/',
      '/recipe-finder': '/',
      '/notes': '/',
      '/timer': '/',
      '/weather': '/',
      '/system-monitor': '/',
      '/settings': '/',
    }

    // Check for direct fallback
    if (fallbacks[currentPath]) {
      return fallbacks[currentPath]
    }

    // Try to find parent by path segments
    const segments = currentPath.split('/').filter(Boolean)

    if (segments.length > 1) {
      // Go up one level (e.g., /plant-monitor/device-123 -> /plant-monitor)
      const parentPath = `/${segments.slice(0, -1).join('/')}`
      return parentPath
    }

    // Default fallback to home
    return '/'
  }

  /**
   * Clear navigation history (e.g., on logout)
   */
  function clearHistory(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear navigation history:', error)
    }
  }

  return {
    addToHistory,
    canGoBack,
    getParentRoute,
    clearHistory,
    getHistory, // Exposed for debugging
  }
}
