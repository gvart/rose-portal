// Timer Types
export type TimerType = 'countdown' | 'stopwatch' | 'pomodoro'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'
export type PomodoroPhase = 'work' | 'break'

// Core Timer Interface
export interface Timer {
  id: string                    // UUID
  type: TimerType
  name: string                  // User-defined label
  status: TimerStatus

  // Time tracking (milliseconds)
  duration: number              // Total duration (countdown/pomodoro)
  elapsed: number               // Time elapsed since start
  remaining: number             // Computed: duration - elapsed

  // Timestamps
  createdAt: Date
  startedAt: Date | null        // When timer started running
  pausedAt: Date | null         // When timer was paused
  completedAt: Date | null      // When timer completed

  // Pomodoro-specific
  pomodoroConfig?: PomodoroConfig

  // Persistence
  shouldPersist: boolean        // Save to localStorage?
}

// Pomodoro Configuration
export interface PomodoroConfig {
  workDuration: number          // Default: 25 minutes (in ms)
  breakDuration: number         // Default: 5 minutes (in ms)
  longBreakDuration: number     // Default: 15 minutes (after 4 cycles)
  cyclesUntilLongBreak: number  // Default: 4
  currentCycle: number          // Track which cycle (1-4)
  currentPhase: PomodoroPhase   // 'work' or 'break'
  totalCycles: number           // How many cycles completed
  autoStartBreaks: boolean      // Auto-transition to breaks
  autoStartWork: boolean        // Auto-transition back to work
}

// Timer Creation Request
export interface CreateTimerRequest {
  type: TimerType
  name: string
  duration?: number             // Required for countdown/pomodoro
  pomodoroConfig?: Partial<PomodoroConfig>
}

// Timer Presets
export interface TimerPreset {
  label: string
  duration: number              // In milliseconds
  icon?: string
}

// Constants
export const TIMER_PRESETS: TimerPreset[] = [
  { label: '1 min', duration: 60 * 1000 },
  { label: '5 min', duration: 5 * 60 * 1000 },
  { label: '10 min', duration: 10 * 60 * 1000 },
  { label: '15 min', duration: 15 * 60 * 1000 },
  { label: '30 min', duration: 30 * 60 * 1000 },
  { label: '1 hour', duration: 60 * 60 * 1000 }
]

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 25 * 60 * 1000,
  breakDuration: 5 * 60 * 1000,
  longBreakDuration: 15 * 60 * 1000,
  cyclesUntilLongBreak: 4,
  currentCycle: 1,
  currentPhase: 'work',
  totalCycles: 0,
  autoStartBreaks: false,
  autoStartWork: false
}
