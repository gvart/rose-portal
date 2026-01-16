<template>
  <div class="timer-list">
    <!-- Empty State -->
    <EmptyState
      v-if="timers.length === 0"
      icon="timer"
      title="No timers yet"
      description="Create a timer to get started"
    />

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
import EmptyState from '@/components/feedback/EmptyState.vue'
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
