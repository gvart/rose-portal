<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div v-if="store.hasActiveTimers" class="timer-floating-pill">
        <div class="pill-container" :class="{ expanded: isExpanded, minimized: isMinimized }">
          <!-- Minimized View (Tiny Indicator) -->
          <div v-if="isMinimized" class="minimized-view" @click="isMinimized = false">
            <svg class="timer-icon" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M12 9v4l2 2" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span class="timer-badge">{{ store.activeTimers.length }}</span>
          </div>

          <!-- Compact View (Single Timer) -->
          <div v-if="!isExpanded && !isMinimized && store.primaryTimer" class="compact-view">
            <div class="timer-info" @click="toggleExpanded">
              <span class="timer-name">{{ store.primaryTimer.name }}</span>
              <span class="timer-type">{{ getTimerTypeLabel(store.primaryTimer.type) }}</span>
            </div>
            <span class="timer-time" @click="toggleExpanded">{{ formattedTime }}</span>
            <button @click.stop="togglePrimaryTimer" class="control-btn" aria-label="Toggle timer">
              <svg v-if="store.primaryTimer.status === 'paused'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
            <button @click.stop="isMinimized = true" class="minimize-btn" aria-label="Minimize">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <!-- Expanded View (Multiple Timers) -->
          <div v-if="isExpanded" class="expanded-view">
            <div class="expanded-header">
              <h3 class="expanded-title">Active Timers ({{ store.activeTimers.length }})</h3>
              <div class="expanded-actions">
                <button @click="minimizeFromExpanded" class="minimize-header-btn" aria-label="Minimize">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button @click="toggleExpanded" class="close-btn" aria-label="Collapse">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="expanded-timers">
              <div
                v-for="timer in store.activeTimers"
                :key="timer.id"
                class="expanded-timer"
              >
                <div class="expanded-timer-info">
                  <span class="expanded-timer-name">{{ timer.name }}</span>
                  <span class="expanded-timer-time">{{ formatTimer(timer) }}</span>
                </div>
                <div class="expanded-timer-controls">
                  <button
                   
                    @click="toggleTimer(timer)"
                    class="mini-control-btn"
                    :aria-label="timer.status === 'paused' ? 'Resume' : 'Pause'"
                  >
                    <svg v-if="timer.status === 'paused'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  </button>
                  <button
                   
                    @click="store.stopTimer(timer.id)"
                    class="mini-control-btn danger"
                    aria-label="Stop timer"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTimerStore } from '@/apps/timer/stores/timerStore'
import { useTimerFormatter } from '@/apps/timer/composables/useTimerFormatter'
import type { Timer } from '@/apps/timer/types/timer'

const store = useTimerStore()
const { formatMilliseconds } = useTimerFormatter()

const isExpanded = ref(false)
const isMinimized = ref(false)

// Formatted time for primary timer
const formattedTime = computed(() => {
  if (!store.primaryTimer) return '0:00'
  return formatTimer(store.primaryTimer)
})

// Format individual timer
function formatTimer(timer: Timer): string {
  if (timer.type === 'stopwatch') {
    return formatMilliseconds(timer.elapsed, false)
  } else {
    return formatMilliseconds(timer.remaining, false)
  }
}

// Get timer type label
function getTimerTypeLabel(type: string): string {
  const labels = {
    countdown: 'Countdown',
    stopwatch: 'Stopwatch',
    pomodoro: 'Pomodoro'
  }
  return labels[type as keyof typeof labels] || type
}

// Toggle expanded/collapsed state
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

// Minimize from expanded view
function minimizeFromExpanded() {
  isExpanded.value = false
  isMinimized.value = true
}

// Toggle primary timer play/pause
function togglePrimaryTimer() {
  if (!store.primaryTimer) return
  toggleTimer(store.primaryTimer)
}

// Toggle any timer play/pause
function toggleTimer(timer: Timer) {
  if (timer.status === 'running') {
    store.pauseTimer(timer.id)
  } else if (timer.status === 'paused') {
    store.resumeTimer(timer.id)
  } else if (timer.status === 'idle') {
    store.startTimer(timer.id)
  }
}
</script>

<style scoped>
.timer-floating-pill {
  position: fixed;
  bottom: calc(var(--safe-bottom) + var(--space-4));
  left: var(--space-3);
  right: var(--space-3);
  z-index: 99;
  pointer-events: none;
}

.pill-container {
  pointer-events: auto;
  background: var(--color-bg-primary);
  border: var(--depth-4-border);
  box-shadow: var(--depth-4-shadow);
  border-radius: var(--radius-lg);
  transition: all var(--duration-slow) var(--ease-in-out);
}

.pill-container.minimized {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  margin: 0 auto;
}

/* Minimized View */
.minimized-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
}

.timer-icon {
  width: 32px;
  height: 32px;
  color: var(--color-warning-solid);
}

.timer-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: var(--color-error-solid);
  color: white;
  font-size: var(--font-size-11);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Compact View */
.compact-view {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.timer-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.timer-name {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timer-type {
  font-size: var(--font-size-11);
  color: var(--color-text-muted);
}

.timer-time {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-bold);
  color: var(--color-warning-solid);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.control-btn {
  padding: var(--space-2);
  color: var(--color-warning-solid);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.control-btn:active {
  transform: scale(0.96);
  background: var(--color-warning-bg);
}

.minimize-btn {
  padding: var(--space-2);
  color: var(--color-text-faint);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.minimize-btn:active {
  transform: scale(0.96);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

/* Expanded View */
.expanded-view {
  padding: var(--space-3) 0;
  max-height: 384px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
}

.expanded-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4) var(--space-3);
  border-bottom: var(--depth-1-border);
}

.expanded-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.expanded-title {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.close-btn,
.minimize-header-btn {
  padding: var(--space-1);
  color: var(--color-text-faint);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.close-btn:active,
.minimize-header-btn:active {
  transform: scale(0.96);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.expanded-timers {
  border-top: var(--depth-1-border);
}

.expanded-timer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--depth-1-border);
}

.expanded-timer:last-child {
  border-bottom: none;
}

.expanded-timer-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.expanded-timer-name {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expanded-timer-time {
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-bold);
  color: var(--color-warning-solid);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.expanded-timer-controls {
  display: flex;
  gap: var(--space-2);
}

.mini-control-btn {
  padding: var(--space-2);
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.mini-control-btn:active {
  transform: scale(0.96);
  background: var(--color-warning-bg);
  color: var(--color-warning-solid);
}

.mini-control-btn.danger:active {
  background: var(--color-error-bg);
  color: var(--color-error-solid);
}

/* Slide Up Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration-slow) var(--ease-in-out);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
