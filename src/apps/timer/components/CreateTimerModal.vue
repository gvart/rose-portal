<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">Create Timer</h2>
            <button @click="handleClose" class="close-btn" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <!-- Timer Name -->
            <div class="form-group">
              <label class="form-label" for="timer-name">Timer Name</label>
              <input
                id="timer-name"
                v-model="name"
                type="text"
                class="form-input"
                placeholder="My Timer"
              />
            </div>

            <!-- Timer Type Selection -->
            <div class="form-group">
              <label class="form-label">Timer Type</label>
              <div class="type-selector">
                <button
                 
                  @click="selectedType = 'countdown'"
                  class="type-btn"
                  :class="{ active: selectedType === 'countdown' }"
                >
                  Countdown
                </button>
                <button
                 
                  @click="selectedType = 'stopwatch'"
                  class="type-btn"
                  :class="{ active: selectedType === 'stopwatch' }"
                >
                  Stopwatch
                </button>
                <button
                 
                  @click="selectedType = 'pomodoro'"
                  class="type-btn"
                  :class="{ active: selectedType === 'pomodoro' }"
                >
                  Pomodoro
                </button>
              </div>
            </div>

            <!-- Quick Presets (Countdown only) -->
            <div v-if="selectedType === 'countdown'" class="form-group">
              <label class="form-label">Quick Presets</label>
              <div class="presets-grid">
                <button
                  v-for="preset in TIMER_PRESETS"
                  :key="preset.label"
                 
                  @click="applyPreset(preset)"
                  class="preset-btn"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- Countdown Duration Input -->
            <div v-if="selectedType === 'countdown'" class="form-group">
              <label class="form-label">Duration</label>
              <div class="duration-inputs">
                <div class="duration-input-group">
                  <input
                    v-model.number="hours"
                    type="number"
                    min="0"
                    max="23"
                    class="duration-input"
                  />
                  <span class="duration-label">h</span>
                </div>
                <div class="duration-input-group">
                  <input
                    v-model.number="minutes"
                    type="number"
                    min="0"
                    max="59"
                    class="duration-input"
                  />
                  <span class="duration-label">m</span>
                </div>
                <div class="duration-input-group">
                  <input
                    v-model.number="seconds"
                    type="number"
                    min="0"
                    max="59"
                    class="duration-input"
                  />
                  <span class="duration-label">s</span>
                </div>
              </div>
            </div>

            <!-- Pomodoro Settings -->
            <div v-if="selectedType === 'pomodoro'" class="form-group">
              <label class="form-label">Pomodoro Settings</label>
              <div class="pomodoro-settings">
                <div class="setting-row">
                  <label class="setting-label">Work Duration</label>
                  <input
                    v-model.number="pomodoroWorkMinutes"
                    type="number"
                    min="1"
                    max="60"
                    class="setting-input"
                  />
                  <span class="setting-unit">min</span>
                </div>
                <div class="setting-row">
                  <label class="setting-label">Break Duration</label>
                  <input
                    v-model.number="pomodoroBreakMinutes"
                    type="number"
                    min="1"
                    max="30"
                    class="setting-input"
                  />
                  <span class="setting-unit">min</span>
                </div>
                <div class="setting-row">
                  <label class="setting-label">Auto-start breaks</label>
                  <input
                    v-model="autoStartBreaks"
                    type="checkbox"
                    class="setting-checkbox"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button @click="handleClose" class="btn-secondary">Cancel</button>
            <button @click="handleCreate" class="btn-primary" :disabled="!isValid">
              Create & Start
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimerStore } from '../stores/timerStore'
import { useTimerFormatter } from '../composables/useTimerFormatter'
import type { TimerType, TimerPreset } from '../types/timer'
import { TIMER_PRESETS } from '../types/timer'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useTimerStore()
const { formatDurationInput } = useTimerFormatter()

// Form state
const name = ref('')
const selectedType = ref<TimerType>('countdown')
const hours = ref(0)
const minutes = ref(5)
const seconds = ref(0)

// Pomodoro settings
const pomodoroWorkMinutes = ref(25)
const pomodoroBreakMinutes = ref(5)
const autoStartBreaks = ref(false)

// Validation
const isValid = computed(() => {
  if (selectedType.value === 'countdown') {
    return hours.value > 0 || minutes.value > 0 || seconds.value > 0
  }
  return true // Stopwatch and Pomodoro always valid
})

// Apply preset
function applyPreset(preset: TimerPreset) {
  const { hours: h, minutes: m, seconds: s } = parseMilliseconds(preset.duration)
  hours.value = h
  minutes.value = m
  seconds.value = s
}

function parseMilliseconds(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return { hours: h, minutes: m, seconds: s }
}

function getDefaultName(type: TimerType): string {
  const defaults = {
    countdown: 'Countdown Timer',
    stopwatch: 'Stopwatch',
    pomodoro: 'Pomodoro'
  }
  return defaults[type]
}

// Create timer
function handleCreate() {
  if (!isValid.value) return

  let duration = 0
  let pomodoroConfig = undefined

  if (selectedType.value === 'countdown') {
    duration = formatDurationInput(hours.value, minutes.value, seconds.value)
  } else if (selectedType.value === 'pomodoro') {
    pomodoroConfig = {
      workDuration: pomodoroWorkMinutes.value * 60 * 1000,
      breakDuration: pomodoroBreakMinutes.value * 60 * 1000,
      longBreakDuration: 15 * 60 * 1000,
      cyclesUntilLongBreak: 4,
      currentCycle: 1,
      currentPhase: 'work' as const,
      totalCycles: 0,
      autoStartBreaks: autoStartBreaks.value,
      autoStartWork: false
    }
    duration = pomodoroConfig.workDuration
  }

  const timer = store.createTimer({
    type: selectedType.value,
    name: name.value.trim() || getDefaultName(selectedType.value),
    duration,
    pomodoroConfig
  })

  // Auto-start the timer
  store.startTimer(timer.id)

  // Reset form
  resetForm()
  handleClose()
}

function resetForm() {
  name.value = ''
  selectedType.value = 'countdown'
  hours.value = 0
  minutes.value = 5
  seconds.value = 0
  pomodoroWorkMinutes.value = 25
  pomodoroBreakMinutes.value = 5
  autoStartBreaks.value = false
}

function handleClose() {
  emit('update:modelValue', false)
}

// Reset form when modal closes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  }
)
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  padding: var(--space-4);
}

/* Modal Container */
.modal-container {
  width: 100%;
  max-width: 512px;
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  border-radius: var(--radius-lg);
  max-height: 90vh;
  overflow-y: auto;
}

/* Modal Header */
.modal-header {
  position: sticky;
  top: 0;
  background: var(--color-bg-primary);
  border-bottom: var(--depth-1-border);
  padding: var(--space-4) var(--space-6);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.close-btn {
  padding: var(--space-2);
  color: var(--color-text-faint);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.close-btn:active {
  background: var(--color-bg-active);
  color: var(--color-text-secondary);
}

/* Modal Content */
.modal-content {
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  display: block;
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.form-input::placeholder {
  color: var(--color-text-faint);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

/* Type Selector */
.type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.type-btn {
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-14);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.type-btn:active {
  background: var(--color-bg-active);
}

.type-btn.active {
  background: var(--color-warning-solid);
  color: white;
}

.type-btn.active:active {
  background: #d97706;
}

/* Presets Grid */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.preset-btn {
  padding: var(--space-2) var(--space-3);
  background: var(--color-warning-bg);
  color: var(--color-warning-text);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.preset-btn:active {
  background: var(--color-warning-border);
}

/* Duration Inputs */
.duration-inputs {
  display: flex;
  gap: var(--space-3);
}

.duration-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.duration-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: var(--font-size-16);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.duration-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.duration-label {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
}

/* Pomodoro Settings */
.pomodoro-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.setting-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.setting-label {
  flex: 1;
  font-size: var(--font-size-13);
  color: var(--color-text-primary);
}

.setting-input {
  width: 80px;
  padding: var(--space-2) var(--space-3);
  border: var(--depth-1-border);
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.setting-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.setting-unit {
  width: 32px;
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
}

.setting-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--color-warning-solid);
  cursor: pointer;
}

/* Modal Actions */
.modal-actions {
  position: sticky;
  bottom: 0;
  background: var(--color-bg-primary);
  border-top: var(--depth-1-border);
  padding: var(--space-4) var(--space-6);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.btn-secondary {
  padding: var(--space-3) var(--space-6);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.btn-secondary:active {
  transform: scale(0.96);
  background: var(--color-bg-active);
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.2);
}

.btn-primary {
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

.btn-primary:active:not(:disabled) {
  transform: scale(0.96);
  background: #d97706;
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.96) translateY(var(--space-4));
  transition: transform var(--duration-slow) var(--ease-in-out);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform var(--duration-slow) var(--ease-in-out);
}
</style>
