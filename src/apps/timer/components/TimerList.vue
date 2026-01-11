<template>
  <div class="timer-list">
    <!-- Empty State -->
    <div v-if="timers.length === 0" class="empty-state">
      <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="empty-text">No timers yet</p>
      <p class="empty-subtext">Create a timer to get started</p>
    </div>

    <!-- Timer Cards -->
    <div v-else class="timer-grid">
      <TimerCard
        v-for="timer in timers"
        :key="timer.id"
        :timer="timer"
        @start="handleStart"
        @pause="handlePause"
        @stop="handleStop"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TimerCard from './TimerCard.vue'
import type { Timer } from '../types/timer'
import { useTimerStore } from '../stores/timerStore'

const props = defineProps<{
  timers: Timer[]
}>()

const store = useTimerStore()

function handleStart(id: string) {
  const timer = props.timers.find((t) => t.id === id)
  if (!timer) return

  if (timer.status === 'idle') {
    store.startTimer(id)
  } else if (timer.status === 'paused') {
    store.resumeTimer(id)
  }
}

function handlePause(id: string) {
  store.pauseTimer(id)
}

function handleStop(id: string) {
  store.stopTimer(id)
}

function handleDelete(id: string) {
  store.deleteTimer(id)
}
</script>

<style scoped>
.timer-list {
  width: 100%;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-4);
}

.empty-icon {
  width: 96px;
  height: 96px;
  color: var(--color-border-secondary);
  margin-bottom: var(--space-4);
}

.empty-text {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtext {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
}

/* Timer Grid */
.timer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .timer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .timer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
