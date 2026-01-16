<template>
  <q-dialog v-model="store.showCompletionModal" @hide="handleAcknowledge" persistent>
    <q-card class="completion-card">
      <q-card-section class="text-center q-pa-lg">
        <!-- Completion Icon -->
        <q-icon name="check_circle" size="96px" color="positive" class="completion-icon" />

        <!-- Completion Message -->
        <h2 class="completion-title q-mt-md">Timer Complete!</h2>
        <p class="completion-message q-mb-md">{{ message }}</p>

        <!-- Pomodoro Phase Info -->
        <div v-if="isPomodoroTransition" class="q-mb-md">
          <q-chip
            :color="store.completedTimer?.pomodoroConfig?.currentPhase === 'work' ? 'positive' : 'negative'"
            text-color="white"
            :label="nextPhaseLabel"
          />
        </div>

        <!-- Acknowledge Button -->
        <q-btn
          unelevated
          color="warning"
          label="Got it!"
          @click="handleAcknowledge"
          class="full-width"
          size="lg"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
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
.completion-card {
  max-width: 448px;
  border-radius: var(--radius-lg);
}

.completion-icon {
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

.completion-title {
  font-size: var(--font-size-32);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.completion-message {
  font-size: var(--font-size-16);
  color: var(--color-text-secondary);
}
</style>
