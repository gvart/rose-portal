import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type {
  Timer,
  TimerType,
  CreateTimerRequest
} from '../types/timer'
import { DEFAULT_POMODORO_CONFIG } from '../types/timer'
import { saveTimers, loadTimers } from '../services/timerPersistence'

// Debounce utility
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const useTimerStore = defineStore('timer', () => {
  // ============ State ============
  const timers = ref<Timer[]>(loadTimers())
  const activeTimerId = ref<string | null>(null)
  const showCreateModal = ref(false)
  const showCompletionModal = ref(false)
  const completedTimer = ref<Timer | null>(null)

  // ============ Computed ============
  const activeTimers = computed(() =>
    timers.value.filter((t) => t.status === 'running')
  )

  const runningTimersCount = computed(() => activeTimers.value.length)

  const hasActiveTimers = computed(() => runningTimersCount.value > 0)

  const primaryTimer = computed(
    () =>
      activeTimers.value[0] ||
      timers.value.find((t) => t.status === 'paused') ||
      null
  )

  const pausedTimers = computed(() =>
    timers.value.filter((t) => t.status === 'paused')
  )

  const idleTimers = computed(() =>
    timers.value.filter((t) => t.status === 'idle')
  )

  // ============ Actions ============

  /**
   * Create a new timer
   */
  function createTimer(request: CreateTimerRequest): Timer {
    const timer: Timer = {
      id: uuidv4(),
      type: request.type,
      name: request.name || getDefaultName(request.type),
      status: 'idle',
      duration: request.duration || 0,
      elapsed: 0,
      remaining: request.duration || 0,
      createdAt: new Date(),
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      shouldPersist: true,
      pomodoroConfig:
        request.type === 'pomodoro'
          ? { ...DEFAULT_POMODORO_CONFIG, ...request.pomodoroConfig }
          : undefined
    }

    timers.value.push(timer)
    return timer
  }

  /**
   * Get default name for timer type
   */
  function getDefaultName(type: TimerType): string {
    const defaults = {
      countdown: 'Countdown Timer',
      stopwatch: 'Stopwatch',
      pomodoro: 'Pomodoro'
    }
    return defaults[type]
  }

  /**
   * Start a timer
   */
  function startTimer(id: string): void {
    const timer = timers.value.find((t) => t.id === id)
    if (!timer) return

    timer.status = 'running'
    timer.startedAt = new Date()
    timer.pausedAt = null
    activeTimerId.value = id
  }

  /**
   * Pause a timer
   */
  function pauseTimer(id: string): void {
    const timer = timers.value.find((t) => t.id === id)
    if (!timer || timer.status !== 'running') return

    timer.status = 'paused'
    timer.pausedAt = new Date()

    if (activeTimerId.value === id) {
      activeTimerId.value = null
    }
  }

  /**
   * Resume a paused timer
   */
  function resumeTimer(id: string): void {
    const timer = timers.value.find((t) => t.id === id)
    if (!timer || timer.status !== 'paused') return

    // Calculate how long it was paused and adjust startedAt
    if (timer.pausedAt && timer.startedAt) {
      const pauseDuration =
        new Date().getTime() - timer.pausedAt.getTime()
      timer.startedAt = new Date(timer.startedAt.getTime() + pauseDuration)
    }

    timer.status = 'running'
    timer.pausedAt = null
    activeTimerId.value = id
  }

  /**
   * Stop a timer completely (remove it)
   */
  function stopTimer(id: string): void {
    const index = timers.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      timers.value.splice(index, 1)
    }

    if (activeTimerId.value === id) {
      activeTimerId.value = null
    }
  }

  /**
   * Delete a timer
   */
  function deleteTimer(id: string): void {
    stopTimer(id)
  }

  /**
   * Update elapsed time for a timer (called by timer engine)
   */
  function updateElapsed(id: string, elapsed: number): void {
    const timer = timers.value.find((t) => t.id === id)
    if (!timer) return

    timer.elapsed = elapsed

    // Calculate remaining time for countdown/pomodoro
    if (timer.type === 'countdown' || timer.type === 'pomodoro') {
      timer.remaining = Math.max(0, timer.duration - elapsed)
    } else {
      // Stopwatch doesn't have remaining time
      timer.remaining = 0
    }
  }

  /**
   * Complete a timer
   */
  function completeTimer(id: string): void {
    const timer = timers.value.find((t) => t.id === id)
    if (!timer) return

    timer.status = 'completed'
    timer.completedAt = new Date()

    // Handle Pomodoro auto-transition
    if (timer.type === 'pomodoro' && timer.pomodoroConfig) {
      handlePomodoroTransition(timer)
      return
    }

    // Show completion modal
    completedTimer.value = timer
    showCompletionModal.value = true

    // Send browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: timer.name || 'Your timer has finished',
        tag: `timer-${id}`,
        requireInteraction: true
      })
    }

    // For non-pomodoro timers, remove after completion
    if (timer.type !== 'pomodoro') {
      // Delay removal to allow completion modal to show
      setTimeout(() => {
        const index = timers.value.findIndex((t) => t.id === id)
        if (index !== -1) {
          timers.value.splice(index, 1)
        }
      }, 500)
    }
  }

  /**
   * Handle Pomodoro phase transitions
   */
  function handlePomodoroTransition(timer: Timer): void {
    if (!timer.pomodoroConfig) return

    const config = timer.pomodoroConfig
    let message = ''
    let shouldAutoStart = false

    if (config.currentPhase === 'work') {
      // Work phase complete → Break
      config.currentCycle++
      config.currentPhase = 'break'

      const isLongBreak =
        config.currentCycle % config.cyclesUntilLongBreak === 0
      timer.duration = isLongBreak
        ? config.longBreakDuration
        : config.breakDuration

      message = isLongBreak
        ? `Time for a long break! ${Math.floor(config.longBreakDuration / 60000)} minutes`
        : `Time for a break! ${Math.floor(config.breakDuration / 60000)} minutes`

      shouldAutoStart = config.autoStartBreaks
    } else {
      // Break complete → Work
      config.currentPhase = 'work'
      config.totalCycles++
      timer.duration = config.workDuration

      message = `Break's over! Back to work`
      shouldAutoStart = config.autoStartWork
    }

    // Reset timer state
    timer.elapsed = 0
    timer.remaining = timer.duration

    if (shouldAutoStart) {
      timer.status = 'running'
      timer.startedAt = new Date()
      timer.pausedAt = null
      timer.completedAt = null
    } else {
      timer.status = 'idle'
      timer.startedAt = null
      timer.pausedAt = null
      timer.completedAt = null
    }

    // Show notification
    completedTimer.value = {
      ...timer,
      name: message
    } as Timer
    showCompletionModal.value = true

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: message,
        tag: `timer-${timer.id}`,
        requireInteraction: true
      })
    }
  }

  /**
   * Acknowledge completion modal
   */
  function acknowledgeCompletion(): void {
    showCompletionModal.value = false
    completedTimer.value = null
  }

  /**
   * Open create modal
   */
  function openCreateModal(): void {
    showCreateModal.value = true
  }

  /**
   * Close create modal
   */
  function closeCreateModal(): void {
    showCreateModal.value = false
  }

  // ============ Persistence ============
  // Auto-save timers to localStorage (debounced)
  const debouncedSave = debounce(() => {
    saveTimers(timers.value)
  }, 500)

  watch(
    timers,
    () => {
      debouncedSave()
    },
    { deep: true }
  )

  return {
    // State
    timers,
    activeTimerId,
    showCreateModal,
    showCompletionModal,
    completedTimer,

    // Computed
    activeTimers,
    runningTimersCount,
    hasActiveTimers,
    primaryTimer,
    pausedTimers,
    idleTimers,

    // Actions
    createTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    deleteTimer,
    updateElapsed,
    completeTimer,
    acknowledgeCompletion,
    openCreateModal,
    closeCreateModal
  }
})
