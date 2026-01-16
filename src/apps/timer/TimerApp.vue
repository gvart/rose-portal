<template>
  <AppLayout title="Timer" theme-color="#F59E0B">
    <div class="timer-app">
      <!-- Header with Create Button -->
      <div class="app-header">
        <h2 class="header-title">My Timers</h2>
        <button @click="store.openCreateModal()" class="create-btn">
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
        <button @click="store.openCreateModal()" class="empty-cta">
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
  width: 100%;
  min-height: 100%;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.header-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-warning-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.create-btn:active {
  transform: scale(0.96);
  background: #d97706;
}

.create-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* Sections */
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.timer-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--space-1);
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-bold);
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
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

@media (min-width: 1280px) {
  .timer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-4);
  padding-top: 80px;
}

.empty-icon {
  width: 128px;
  height: 128px;
  color: var(--color-border-secondary);
  margin-bottom: var(--space-6);
}

.empty-text {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.empty-subtext {
  font-size: var(--font-size-14);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
}

.empty-cta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--color-warning-solid);
  color: white;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.empty-cta:active {
  transform: scale(0.96);
  background: #d97706;
}

.empty-cta:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}
</style>
