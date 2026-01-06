<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="store.showCompletionModal" class="completion-overlay" @click="handleAcknowledge">
        <div class="completion-content" @click.stop>
          <!-- Completion Icon -->
          <div class="completion-icon-container">
            <svg class="completion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <!-- Completion Message -->
          <h2 class="completion-title">Timer Complete!</h2>
          <p class="completion-message">{{ message }}</p>

          <!-- Pomodoro Phase Info -->
          <div v-if="isPomodoroTransition" class="pomodoro-phase">
            <span class="phase-badge" :class="phaseClass">
              {{ nextPhaseLabel }}
            </span>
          </div>

          <!-- Acknowledge Button -->
          <button v-haptic:heavy @click="handleAcknowledge" class="acknowledge-btn">
            Got it!
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimerStore } from '@/apps/timer/stores/timerStore'

const store = useTimerStore()

// Completion message
const message = computed(() => {
  if (!store.completedTimer) return ''
  return store.completedTimer.name || 'Your timer has finished'
})

// Check if this is a Pomodoro transition
const isPomodoroTransition = computed(() => {
  return store.completedTimer?.type === 'pomodoro' && store.completedTimer?.pomodoroConfig
})

// Next phase label for Pomodoro
const nextPhaseLabel = computed(() => {
  if (!isPomodoroTransition.value || !store.completedTimer?.pomodoroConfig) {
    return ''
  }
  const phase = store.completedTimer.pomodoroConfig.currentPhase
  return phase === 'work' ? 'Break Time' : 'Work Time'
})

// Phase class for styling
const phaseClass = computed(() => {
  if (!isPomodoroTransition.value || !store.completedTimer?.pomodoroConfig) {
    return ''
  }
  const phase = store.completedTimer.pomodoroConfig.currentPhase
  return phase === 'work' ? 'phase-break' : 'phase-work'
})

// Handle acknowledgment
function handleAcknowledge() {
  store.acknowledgeCompletion()
}
</script>

<style scoped>
/* Completion Overlay */
.completion-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    background-color: rgba(0, 0, 0, 0.7);
  }
  50% {
    background-color: rgba(0, 0, 0, 0.8);
  }
}

/* Completion Content */
.completion-content {
  @apply w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center
    transform transition-all duration-300;
}

/* Completion Icon */
.completion-icon-container {
  @apply flex items-center justify-center mb-6;
}

.completion-icon {
  @apply w-24 h-24 text-green-500;
  animation: check-bounce 0.6s ease;
}

@keyframes check-bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Completion Text */
.completion-title {
  @apply text-3xl font-bold text-gray-900 mb-3;
}

.completion-message {
  @apply text-lg text-gray-700 mb-6;
}

/* Pomodoro Phase Info */
.pomodoro-phase {
  @apply flex justify-center mb-6;
}

.phase-badge {
  @apply px-4 py-2 rounded-full font-semibold text-sm;
}

.phase-work {
  @apply bg-red-100 text-red-700;
}

.phase-break {
  @apply bg-green-100 text-green-700;
}

/* Acknowledge Button */
.acknowledge-btn {
  @apply w-full px-8 py-4 bg-amber-500 text-white font-bold text-lg rounded-xl
    hover:bg-amber-600 transition-all duration-150 active:scale-95
    focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-offset-2;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300 ease-out;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .completion-content,
.modal-leave-to .completion-content {
  @apply scale-90 translate-y-8;
}
</style>
