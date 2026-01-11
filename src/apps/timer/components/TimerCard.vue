<template>
  <div class="timer-card" :class="{ running: timer.status === 'running' }">
    <!-- Timer Header -->
    <div class="timer-header">
      <div class="timer-info">
        <h3 class="timer-name">{{ timer.name }}</h3>
        <span class="timer-type-badge">{{ timerTypeLabel }}</span>
      </div>
      <button v-haptic:light @click="$emit('delete', timer.id)" class="delete-btn" aria-label="Delete timer">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Timer Display -->
    <div class="timer-display">
      <span class="time-value">{{ formattedTime }}</span>
      <span v-if="showRemaining" class="time-label">{{ timeLabel }}</span>
    </div>

    <!-- Pomodoro Phase Indicator -->
    <div v-if="timer.type === 'pomodoro' && timer.pomodoroConfig" class="pomodoro-info">
      <span class="phase-badge" :class="phaseClass">
        {{ timer.pomodoroConfig.currentPhase === 'work' ? 'Work' : 'Break' }}
      </span>
      <span class="cycle-count">
        Cycle {{ timer.pomodoroConfig.currentCycle }} / {{ timer.pomodoroConfig.cyclesUntilLongBreak }}
      </span>
    </div>

    <!-- Timer Controls -->
    <div class="timer-controls">
      <!-- Play/Pause Button -->
      <button
        v-if="timer.status === 'idle' || timer.status === 'paused'"
        v-haptic:medium
        @click="handleStart"
        class="control-btn primary"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <span>{{ timer.status === 'idle' ? 'Start' : 'Resume' }}</span>
      </button>

      <button
        v-if="timer.status === 'running'"
        v-haptic:medium
        @click="$emit('pause', timer.id)"
        class="control-btn secondary"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
        <span>Pause</span>
      </button>

      <!-- Stop Button -->
      <button
        v-if="timer.status !== 'idle'"
        v-haptic:light
        @click="$emit('stop', timer.id)"
        class="control-btn danger"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
        <span>Stop</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Timer } from '../types/timer'
import { useTimerFormatter } from '../composables/useTimerFormatter'

const props = defineProps<{
  timer: Timer
}>()

const emit = defineEmits<{
  start: [id: string]
  pause: [id: string]
  stop: [id: string]
  delete: [id: string]
}>()

const { formatMilliseconds } = useTimerFormatter()

// Timer type label
const timerTypeLabel = computed(() => {
  const labels = {
    countdown: 'Countdown',
    stopwatch: 'Stopwatch',
    pomodoro: 'Pomodoro'
  }
  return labels[props.timer.type]
})

// Formatted time display
const formattedTime = computed(() => {
  if (props.timer.type === 'stopwatch') {
    return formatMilliseconds(props.timer.elapsed, false)
  } else {
    // Countdown and Pomodoro show remaining time
    return formatMilliseconds(props.timer.remaining, false)
  }
})

// Show remaining time label
const showRemaining = computed(() => {
  return props.timer.type !== 'stopwatch' && props.timer.status === 'running'
})

// Time label
const timeLabel = computed(() => {
  if (props.timer.type === 'stopwatch') {
    return 'elapsed'
  }
  return 'remaining'
})

// Pomodoro phase class
const phaseClass = computed(() => {
  if (props.timer.type !== 'pomodoro' || !props.timer.pomodoroConfig) {
    return ''
  }
  return props.timer.pomodoroConfig.currentPhase === 'work'
    ? 'phase-work'
    : 'phase-break'
})

// Handle start (either start or resume)
function handleStart() {
  if (props.timer.status === 'idle') {
    emit('start', props.timer.id)
  } else if (props.timer.status === 'paused') {
    emit('start', props.timer.id) // Store handles resume logic
  }
}
</script>

<style scoped>
.timer-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  border: var(--depth-1-border);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: all var(--duration-normal) var(--ease-in-out);
}

.timer-card.running {
  border-color: var(--color-warning-solid);
  box-shadow: 0 0 0 1px var(--color-warning-solid);
}

/* Header */
.timer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.timer-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.timer-name {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.timer-type-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-medium);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
}

.delete-btn {
  padding: var(--space-2);
  color: var(--color-text-faint);
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.delete-btn:active {
  transform: scale(0.96);
  background: var(--color-error-bg);
  color: var(--color-error-solid);
}

/* Timer Display */
.timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8) 0;
}

.time-value {
  font-size: 56px;
  font-weight: var(--font-weight-bold);
  color: var(--color-warning-solid);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.time-label {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

/* Pomodoro Info */
.pomodoro-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  font-size: var(--font-size-13);
}

.phase-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.phase-work {
  background: var(--color-error-bg);
  color: var(--color-error-text);
}

.phase-break {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

.cycle-count {
  color: var(--color-text-secondary);
}

/* Controls */
.timer-controls {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.control-btn:active {
  transform: scale(0.96);
}

.control-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.control-btn.primary {
  background: var(--color-warning-solid);
  color: white;
}

.control-btn.primary:active {
  background: #d97706;
}

.control-btn.secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.control-btn.danger {
  background: var(--color-error-bg);
  color: var(--color-error-text);
}
</style>
