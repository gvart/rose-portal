/**
 * Debounce utility for performance optimization
 * Delays function execution until after a specified delay has elapsed
 * since the last time it was invoked.
 *
 * Useful for:
 * - Input validation in modals
 * - Search queries
 * - Window resize handlers
 * - Any expensive operation that shouldn't run on every change
 */

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttle utility - limits function execution to once per specified time period
 * Useful for scroll events and other high-frequency events
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
