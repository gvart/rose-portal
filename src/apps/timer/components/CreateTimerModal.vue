<template>
  <PwaModal
    :model-value="modelValue"
    @update:model-value="val => $emit('update:modelValue', val)"
    :show-submit="true"
    :can-submit="isValid"
    @submit="handleCreate"
    @close="handleClose"
  >
    <template #title>Create Timer</template>

    <q-form class="form-grid">
      <!-- Timer Name - Full Width -->
      <div class="input-section full-width">
        <label class="input-label">Timer Name</label>
        <q-input
          v-model="name"
          outlined
          dense
          placeholder="My Timer"
          :readonly="isPi5"
          @click="isPi5 && (showKeyboard = true)"
          @focus="isPi5 && (showKeyboard = true)"
        />
      </div>

      <!-- Timer Type - Full Width -->
      <div class="input-section full-width">
        <label class="input-label">Timer Type</label>
        <q-btn-toggle
          v-model="selectedType"
          spread
          unelevated
          toggle-color="warning"
          color="grey-3"
          text-color="grey-9"
          dense
          :options="[
            { label: 'Countdown', value: 'countdown' },
            { label: 'Stopwatch', value: 'stopwatch' },
            { label: 'Pomodoro', value: 'pomodoro' }
          ]"
        />
      </div>

      <!-- Quick Presets (Countdown only) -->
      <div v-if="selectedType === 'countdown'" class="input-section full-width">
        <label class="input-label">Quick Presets</label>
        <div class="preset-grid">
          <q-btn
            v-for="preset in TIMER_PRESETS"
            :key="preset.label"
            :label="preset.label"
            color="warning"
            text-color="white"
            unelevated
            dense
            @click="applyPreset(preset)"
          />
        </div>
      </div>

      <!-- Countdown Duration Input -->
      <template v-if="selectedType === 'countdown'">
        <div class="input-section">
          <label class="input-label">Hours</label>
          <q-input
            v-model.number="hours"
            type="number"
            min="0"
            max="23"
            suffix="h"
            outlined
            dense
            input-class="text-center numeric-data"
          />
        </div>
        <div class="input-section">
          <label class="input-label">Minutes</label>
          <q-input
            v-model.number="minutes"
            type="number"
            min="0"
            max="59"
            suffix="m"
            outlined
            dense
            input-class="text-center numeric-data"
          />
        </div>
        <div class="input-section full-width">
          <label class="input-label">Seconds</label>
          <q-input
            v-model.number="seconds"
            type="number"
            min="0"
            max="59"
            suffix="s"
            outlined
            dense
            input-class="text-center numeric-data"
            style="max-width: 50%;"
          />
        </div>
      </template>

      <!-- Pomodoro Settings -->
      <template v-if="selectedType === 'pomodoro'">
        <div class="input-section">
          <label class="input-label">Work Duration</label>
          <q-input
            v-model.number="pomodoroWorkMinutes"
            type="number"
            min="1"
            max="60"
            suffix="min"
            outlined
            dense
            input-class="text-center numeric-data"
          />
        </div>
        <div class="input-section">
          <label class="input-label">Break Duration</label>
          <q-input
            v-model.number="pomodoroBreakMinutes"
            type="number"
            min="1"
            max="30"
            suffix="min"
            outlined
            dense
            input-class="text-center numeric-data"
          />
        </div>
        <div class="toggle-row full-width">
          <label class="input-label">Auto-start breaks</label>
          <q-toggle v-model="autoStartBreaks" color="warning" />
        </div>
      </template>
    </q-form>
  </PwaModal>

  <!-- On-Screen Keyboard (Pi5 only) -->
  <Teleport to="body">
    <FloatingKeyboard
      v-if="isPi5"
      v-model="name"
      v-model:show="showKeyboard"
      :docked="true"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import { useTimerStore } from '../stores/timerStore'
import { useTimerFormatter } from '../composables/useTimerFormatter'
import type { TimerType, TimerPreset } from '../types/timer'
import { TIMER_PRESETS } from '../types/timer'
import PwaModal from '@/components/common/PwaModal.vue'
import FloatingKeyboard from '@/components/common/FloatingKeyboard.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useTimerStore()
const { formatDurationInput } = useTimerFormatter()
const { isPi5 } = useDeviceDetection()

// Form state
const name = ref('')
const selectedType = ref<TimerType>('countdown')
const hours = ref(0)
const minutes = ref(5)
const seconds = ref(0)
const showKeyboard = ref(false)

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
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 480px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.full-width {
  grid-column: 1 / -1;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

@media (min-width: 480px) {
  .preset-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.numeric-data {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* Mobile-specific optimizations for phones */
@media (max-width: 768px) {
  .form-grid {
    gap: 12px !important;
  }

  .preset-grid {
    gap: 8px !important;
  }

  .input-section {
    gap: 4px !important;
  }

  .preset-grid .q-btn {
    min-height: 40px !important;
    font-size: 13px !important;
  }
}

/* Ultra-compact optimizations for Pi5 */
@media (max-height: 768px) {
  /* Horizontal timer type selection */
  .q-btn-toggle {
    font-size: 11px !important;
  }

  /* Compact time input */
  .q-input {
    font-size: 12px !important;
  }

  /* Preset buttons in single row with 4 columns */
  .preset-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 6px !important;
  }

  .preset-grid .q-btn {
    font-size: 11px !important;
    padding: 4px 6px !important;
  }
}
</style>
