<template>
  <q-card class="timer-card" :class="{ running: timer.status === 'running' }">
    <q-card-section>
      <!-- Timer Header -->
      <div class="timer-header">
        <div class="timer-info">
          <h3 class="timer-name">{{ timer.name }}</h3>
          <q-chip
            dense
            size="sm"
            :label="timerTypeLabel"
            color="grey-3"
            text-color="grey-7"
            class="timer-type-badge"
          />
        </div>
        <q-btn
          flat
          dense
          round
          icon="close"
          color="grey-5"
          @click="$emit('delete', timer.id)"
          aria-label="Delete timer"
          class="delete-btn"
        />
      </div>

      <!-- Timer Display -->
      <div class="timer-display">
        <span class="time-value">{{ formattedTime }}</span>
        <span v-if="showRemaining" class="time-label">{{ timeLabel }}</span>
      </div>

      <!-- Pomodoro Phase Indicator -->
      <div v-if="timer.type === 'pomodoro' && timer.pomodoroConfig" class="pomodoro-info">
        <q-chip
          dense
          :color="timer.pomodoroConfig.currentPhase === 'work' ? 'negative' : 'positive'"
          text-color="white"
          :label="timer.pomodoroConfig.currentPhase === 'work' ? 'Work' : 'Break'"
        />
        <span class="cycle-count">
          Cycle {{ timer.pomodoroConfig.currentCycle }} / {{ timer.pomodoroConfig.cyclesUntilLongBreak }}
        </span>
      </div>

      <!-- Timer Controls -->
      <div class="timer-controls">
        <!-- Play/Pause Button -->
        <q-btn
          v-if="timer.status === 'idle' || timer.status === 'paused'"
          unelevated
          color="warning"
          icon="play_arrow"
          :label="timer.status === 'idle' ? 'Start' : 'Resume'"
          @click="handleStart"
          class="control-btn"
        />

        <q-btn
          v-if="timer.status === 'running'"
          unelevated
          color="grey-4"
          text-color="grey-9"
          icon="pause"
          label="Pause"
          @click="$emit('pause', timer.id)"
          class="control-btn"
        />

        <!-- Stop Button -->
        <q-btn
          v-if="timer.status !== 'idle'"
          flat
          color="negative"
          icon="stop"
          label="Stop"
          @click="$emit('stop', timer.id)"
          class="control-btn"
        />
      </div>
    </q-card-section>
  </q-card>
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
  transition: all var(--duration-normal) var(--ease-in-out);
}

.timer-card.running {
  border-color: var(--color-warning-solid);
  box-shadow: 0 0 0 1px var(--color-warning-solid);
}

.timer-card:deep(.q-card__section) {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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

.delete-btn:active {
  transform: scale(0.96);
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

.cycle-count {
  color: var(--color-text-secondary);
}

/* Controls */
.timer-controls {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.control-btn:active {
  transform: scale(0.96);
}
</style>
