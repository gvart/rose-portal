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
  @apply w-full;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center py-16 px-4;
}

.empty-icon {
  @apply w-24 h-24 text-gray-300 mb-4;
}

.empty-text {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.empty-subtext {
  @apply text-sm text-gray-500;
}

/* Timer Grid */
.timer-grid {
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 768px) {
  .timer-grid {
    @apply grid-cols-2;
  }
}

@media (min-width: 1024px) {
  .timer-grid {
    @apply grid-cols-2;
  }
}
</style>
