<template>
  <AppLayout title="Timer" theme-color="#F59E0B">
    <div class="timer-app">
      <!-- Header with Create Button -->
      <div class="app-header">
        <h2 class="header-title">My Timers</h2>
        <button v-haptic @click="store.openCreateModal()" class="create-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Timer</span>
        </button>
      </div>

      <!-- Active Timers Section -->
      <section v-if="store.activeTimers.length > 0" class="section">
        <h3 class="section-title">
          Running
          <span class="timer-count">{{ store.activeTimers.length }}</span>
        </h3>
        <div class="timer-grid">
          <TimerCard
            v-for="timer in store.activeTimers"
            :key="timer.id"
            :timer="timer"
            @start="handleStart"
            @pause="handlePause"
            @stop="handleStop"
            @delete="handleDelete"
          />
        </div>
      </section>

      <!-- Paused Timers Section -->
      <section v-if="store.pausedTimers.length > 0" class="section">
        <h3 class="section-title">
          Paused
          <span class="timer-count">{{ store.pausedTimers.length }}</span>
        </h3>
        <div class="timer-grid">
          <TimerCard
            v-for="timer in store.pausedTimers"
            :key="timer.id"
            :timer="timer"
            @start="handleStart"
            @pause="handlePause"
            @stop="handleStop"
            @delete="handleDelete"
          />
        </div>
      </section>

      <!-- Idle Timers Section -->
      <section v-if="store.idleTimers.length > 0" class="section">
        <h3 class="section-title">
          Ready
          <span class="timer-count">{{ store.idleTimers.length }}</span>
        </h3>
        <div class="timer-grid">
          <TimerCard
            v-for="timer in store.idleTimers"
            :key="timer.id"
            :timer="timer"
            @start="handleStart"
            @pause="handlePause"
            @stop="handleStop"
            @delete="handleDelete"
          />
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="store.timers.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="empty-text">No timers yet</p>
        <p class="empty-subtext">Create your first timer to get started</p>
        <button v-haptic @click="store.openCreateModal()" class="empty-cta">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Timer
        </button>
      </div>

      <!-- Create Timer Modal -->
      <CreateTimerModal v-model="store.showCreateModal" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import TimerCard from './components/TimerCard.vue'
import CreateTimerModal from './components/CreateTimerModal.vue'
import { useTimerStore } from './stores/timerStore'

const store = useTimerStore()

function handleStart(id: string) {
  const timer = store.timers.find((t) => t.id === id)
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
.timer-app {
  @apply w-full min-h-full p-4 space-y-6;
}

/* Header */
.app-header {
  @apply flex items-center justify-between mb-6;
}

.header-title {
  @apply text-2xl font-bold text-gray-900;
}

.create-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg
    hover:bg-amber-600 transition-all duration-150 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2;
}

/* Sections */
.section {
  @apply space-y-4;
}

.section-title {
  @apply flex items-center gap-2 text-lg font-semibold text-gray-900;
}

.timer-count {
  @apply inline-flex items-center justify-center w-6 h-6 text-xs font-bold
    bg-amber-100 text-amber-700 rounded-full;
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

@media (min-width: 1280px) {
  .timer-grid {
    @apply grid-cols-3;
  }
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center py-20 px-4;
}

.empty-icon {
  @apply w-32 h-32 text-gray-300 mb-6;
}

.empty-text {
  @apply text-2xl font-semibold text-gray-900 mb-2;
}

.empty-subtext {
  @apply text-base text-gray-500 mb-8;
}

.empty-cta {
  @apply flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg
    hover:bg-amber-600 transition-all duration-150 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2;
}
</style>
