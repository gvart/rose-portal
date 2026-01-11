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
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  padding: var(--space-4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    background-color: rgba(0, 0, 0, 0.6);
  }
  50% {
    background-color: rgba(0, 0, 0, 0.7);
  }
}

/* Completion Content */
.completion-content {
  width: 100%;
  max-width: 448px;
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  text-align: center;
  transform: scale(1);
  transition: all var(--duration-slow) var(--ease-in-out);
}

/* Completion Icon */
.completion-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.completion-icon {
  width: 96px;
  height: 96px;
  color: var(--color-success-solid);
  animation: check-bounce 0.6s var(--ease-in-out);
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
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.completion-message {
  font-size: var(--font-size-16);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

/* Pomodoro Phase Info */
.pomodoro-phase {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.phase-badge {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-13);
}

.phase-work {
  background: var(--color-error-bg);
  color: var(--color-error-text);
}

.phase-break {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

/* Acknowledge Button */
.acknowledge-btn {
  width: 100%;
  padding: var(--space-4) var(--space-8);
  background: var(--color-warning-solid);
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-16);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.acknowledge-btn:active {
  transform: scale(0.96);
  background: #d97706;
}

.acknowledge-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .completion-content,
.modal-leave-to .completion-content {
  transform: scale(0.9) translateY(var(--space-8));
  transition: transform var(--duration-slow) var(--ease-in-out);
}

.modal-enter-active .completion-content,
.modal-leave-active .completion-content {
  transition: transform var(--duration-slow) var(--ease-in-out);
}
</style>
