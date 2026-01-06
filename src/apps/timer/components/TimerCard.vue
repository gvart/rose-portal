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
  @apply bg-white rounded-xl shadow-md p-6 space-y-4 border-2 border-transparent
    transition-all duration-200;
}

.timer-card.running {
  @apply border-amber-400 shadow-lg;
}

/* Header */
.timer-header {
  @apply flex items-start justify-between;
}

.timer-info {
  @apply flex flex-col gap-2;
}

.timer-name {
  @apply text-xl font-semibold text-gray-900;
}

.timer-type-badge {
  @apply inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700
    rounded-full;
}

.delete-btn {
  @apply p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg
    transition-colors;
}

/* Timer Display */
.timer-display {
  @apply flex flex-col items-center py-8;
}

.time-value {
  @apply text-6xl font-bold text-amber-500 tabular-nums;
  font-variant-numeric: tabular-nums;
}

.time-label {
  @apply text-sm text-gray-500 mt-2;
}

/* Pomodoro Info */
.pomodoro-info {
  @apply flex items-center justify-center gap-3 text-sm;
}

.phase-badge {
  @apply px-3 py-1 rounded-full font-medium;
}

.phase-work {
  @apply bg-red-100 text-red-700;
}

.phase-break {
  @apply bg-green-100 text-green-700;
}

.cycle-count {
  @apply text-gray-600;
}

/* Controls */
.timer-controls {
  @apply flex gap-3 justify-center;
}

.control-btn {
  @apply flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
    transition-all duration-150 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.control-btn.primary {
  @apply bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500;
}

.control-btn.secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500;
}

.control-btn.danger {
  @apply bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500;
}
</style>
