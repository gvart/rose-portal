<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">Create Timer</h2>
            <button v-haptic:light @click="handleClose" class="close-btn" aria-label="Close">
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
                  v-haptic:light
                  @click="selectedType = 'countdown'"
                  class="type-btn"
                  :class="{ active: selectedType === 'countdown' }"
                >
                  Countdown
                </button>
                <button
                  v-haptic:light
                  @click="selectedType = 'stopwatch'"
                  class="type-btn"
                  :class="{ active: selectedType === 'stopwatch' }"
                >
                  Stopwatch
                </button>
                <button
                  v-haptic:light
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
                  v-haptic:light
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
            <button v-haptic @click="handleClose" class="btn-secondary">Cancel</button>
            <button v-haptic @click="handleCreate" class="btn-primary" :disabled="!isValid">
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
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4;
}

/* Modal Container */
.modal-container {
  @apply w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto;
}

/* Modal Header */
.modal-header {
  @apply sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl
    flex items-center justify-between;
}

.modal-title {
  @apply text-2xl font-bold text-gray-900;
}

.close-btn {
  @apply p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors;
}

/* Modal Content */
.modal-content {
  @apply px-6 py-4 space-y-6;
}

/* Form Groups */
.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
    text-base text-gray-900 placeholder-gray-400 transition-all duration-150;
}

/* Type Selector */
.type-selector {
  @apply grid grid-cols-3 gap-2;
}

.type-btn {
  @apply px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium
    transition-all duration-150 hover:bg-gray-200
    focus:outline-none focus:ring-2 focus:ring-amber-500;
}

.type-btn.active {
  @apply bg-amber-500 text-white hover:bg-amber-600;
}

/* Presets Grid */
.presets-grid {
  @apply grid grid-cols-3 gap-2;
}

.preset-btn {
  @apply px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium
    hover:bg-amber-100 transition-colors
    focus:outline-none focus:ring-2 focus:ring-amber-500;
}

/* Duration Inputs */
.duration-inputs {
  @apply flex gap-3;
}

.duration-input-group {
  @apply flex-1 flex items-center gap-2;
}

.duration-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg text-center
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
    text-lg font-semibold text-gray-900;
}

.duration-label {
  @apply text-sm font-medium text-gray-500;
}

/* Pomodoro Settings */
.pomodoro-settings {
  @apply space-y-3;
}

.setting-row {
  @apply flex items-center gap-3;
}

.setting-label {
  @apply flex-1 text-sm text-gray-700;
}

.setting-input {
  @apply w-20 px-3 py-2 border border-gray-300 rounded-lg text-center
    focus:outline-none focus:ring-2 focus:ring-amber-500;
}

.setting-unit {
  @apply text-sm text-gray-500 w-8;
}

.setting-checkbox {
  @apply w-5 h-5 text-amber-500 border-gray-300 rounded
    focus:ring-2 focus:ring-amber-500;
}

/* Modal Actions */
.modal-actions {
  @apply sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl
    flex gap-3 justify-end;
}

.btn-secondary {
  @apply px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg
    hover:bg-gray-300 transition-all duration-150 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}

.btn-primary {
  @apply px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg
    hover:bg-amber-600 transition-all duration-150 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100;
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

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  @apply scale-95 translate-y-4;
}
</style>
