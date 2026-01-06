import type { Timer } from '../types/timer'

const STORAGE_KEY = 'rose-portal-timers'
const STORAGE_VERSION = 1

interface StoredTimersState {
  timers: Timer[]
  version: number
}

/**
 * Save timers to localStorage
 * Only persists timers marked with shouldPersist: true
 * Filters out completed timers
 */
export function saveTimers(timers: Timer[]): void {
  try {
    const persistable = timers.filter(
      (t) => t.shouldPersist && t.status !== 'completed'
    )

    const state: StoredTimersState = {
      timers: persistable.map((timer) => ({
        ...timer,
        // Convert dates to ISO strings for JSON serialization
        createdAt: timer.createdAt,
        startedAt: timer.startedAt,
        pausedAt: timer.pausedAt,
        completedAt: timer.completedAt
      })),
      version: STORAGE_VERSION
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save timers to localStorage:', error)
  }
}

/**
 * Load timers from localStorage
 * Restores timers but resets running timers to paused for safety
 */
export function loadTimers(): Timer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const state: StoredTimersState = JSON.parse(stored)

    // Check version for potential migrations
    if (state.version !== STORAGE_VERSION) {
      console.warn('Timer storage version mismatch, clearing storage')
      clearTimers()
      return []
    }

    // Restore timers with safety measures
    return state.timers.map((timer) => ({
      ...timer,
      // Reset running timers to paused on page reload
      status: timer.status === 'running' ? 'paused' : timer.status,
      // Clear timestamps for safety
      startedAt: null,
      pausedAt: null,
      // Restore dates from ISO strings
      createdAt: new Date(timer.createdAt),
      completedAt: timer.completedAt ? new Date(timer.completedAt) : null
    })) as Timer[]
  } catch (error) {
    console.error('Failed to load timers from localStorage:', error)
    return []
  }
}

/**
 * Clear all timers from localStorage
 */
export function clearTimers(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear timers from localStorage:', error)
  }
}
