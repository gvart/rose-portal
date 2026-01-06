/**
 * Timer formatting utilities
 * Formats milliseconds into human-readable time strings
 */
export function useTimerFormatter() {
  /**
   * Format milliseconds into time string (HH:MM:SS or MM:SS)
   * @param ms - Milliseconds to format
   * @param includeMs - Whether to include milliseconds (.XX)
   * @returns Formatted time string
   */
  function formatMilliseconds(ms: number, includeMs = false): string {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor((ms % 1000) / 10)

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}`
    }

    if (includeMs) {
      return `${minutes}:${pad(seconds)}.${pad(milliseconds)}`
    }

    return `${minutes}:${pad(seconds)}`
  }

  /**
   * Pad number with leading zero
   */
  function pad(num: number): string {
    return num.toString().padStart(2, '0')
  }

  /**
   * Convert hours, minutes, seconds input into milliseconds
   */
  function formatDurationInput(
    hours: number,
    minutes: number,
    seconds: number
  ): number {
    return (hours * 3600 + minutes * 60 + seconds) * 1000
  }

  /**
   * Parse milliseconds into hours, minutes, seconds components
   */
  function parseMilliseconds(ms: number): {
    hours: number
    minutes: number
    seconds: number
  } {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return { hours, minutes, seconds }
  }

  /**
   * Format time in compact format (e.g., "5m", "1h 23m", "45s")
   */
  function formatCompact(ms: number): string {
    const { hours, minutes, seconds } = parseMilliseconds(ms)

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }

    if (minutes > 0) {
      return `${minutes}m`
    }

    return `${seconds}s`
  }

  return {
    formatMilliseconds,
    formatDurationInput,
    parseMilliseconds,
    formatCompact,
    pad
  }
}
