<template>
  <Teleport to="body">
    <Transition name="slide-down">
      <div v-if="store.hasActiveTimers" class="timer-floating-pill">
        <div class="pill-container" :class="{ expanded: isExpanded }">
          <!-- Compact View (Single Timer) -->
          <div v-if="!isExpanded && store.primaryTimer" class="compact-view" @click="toggleExpanded">
            <div class="timer-info">
              <span class="timer-name">{{ store.primaryTimer.name }}</span>
              <span class="timer-type">{{ getTimerTypeLabel(store.primaryTimer.type) }}</span>
            </div>
            <span class="timer-time">{{ formattedTime }}</span>
            <button v-haptic:medium @click.stop="togglePrimaryTimer" class="control-btn" aria-label="Toggle timer">
              <svg v-if="store.primaryTimer.status === 'paused'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
          </div>

          <!-- Expanded View (Multiple Timers) -->
          <div v-if="isExpanded" class="expanded-view">
            <div class="expanded-header">
              <h3 class="expanded-title">Active Timers ({{ store.activeTimers.length }})</h3>
              <button v-haptic:light @click="toggleExpanded" class="close-btn" aria-label="Collapse">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
                    v-haptic:light
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
                    v-haptic:light
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
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  left: 12px;
  right: 12px;
  z-index: 99;
  pointer-events: none;
}

.pill-container {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* Compact View */
.compact-view {
  @apply flex items-center gap-3 px-4 py-3 cursor-pointer;
}

.timer-info {
  @apply flex flex-col flex-1 min-w-0;
}

.timer-name {
  @apply text-sm font-semibold text-gray-900 truncate;
}

.timer-type {
  @apply text-xs text-gray-500;
}

.timer-time {
  @apply text-lg font-bold text-amber-500 tabular-nums;
  font-variant-numeric: tabular-nums;
}

.control-btn {
  @apply p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors;
}

/* Expanded View */
.expanded-view {
  @apply py-3 max-h-96 overflow-y-auto;
}

.expanded-header {
  @apply flex items-center justify-between px-4 pb-3 border-b border-gray-200;
}

.expanded-title {
  @apply text-sm font-semibold text-gray-900;
}

.close-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors;
}

.expanded-timers {
  @apply divide-y divide-gray-100;
}

.expanded-timer {
  @apply flex items-center justify-between px-4 py-3;
}

.expanded-timer-info {
  @apply flex flex-col flex-1 min-w-0;
}

.expanded-timer-name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.expanded-timer-time {
  @apply text-lg font-bold text-amber-500 tabular-nums;
  font-variant-numeric: tabular-nums;
}

.expanded-timer-controls {
  @apply flex gap-2;
}

.mini-control-btn {
  @apply p-2 text-gray-600 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors;
}

.mini-control-btn.danger {
  @apply hover:text-red-500 hover:bg-red-50;
}

/* Slide Up Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  @apply transition-all duration-300 ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  @apply opacity-0 translate-y-full;
}
</style>
