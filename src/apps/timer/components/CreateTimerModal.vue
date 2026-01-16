<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card class="create-timer-card">
      <q-card-section>
        <div class="row items-center q-pb-none">
          <div class="text-h6">Create Timer</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="handleClose" />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form>
          <!-- Timer Name -->
          <q-input
            v-model="name"
            label="Timer Name"
            placeholder="My Timer"
            outlined
            class="q-mb-md"
          />

          <!-- Timer Type Selection -->
          <div class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-sm">Timer Type</div>
            <q-btn-toggle
              v-model="selectedType"
              spread
              unelevated
              toggle-color="warning"
              color="grey-3"
              text-color="grey-9"
              :options="[
                { label: 'Countdown', value: 'countdown' },
                { label: 'Stopwatch', value: 'stopwatch' },
                { label: 'Pomodoro', value: 'pomodoro' }
              ]"
            />
          </div>

          <!-- Quick Presets (Countdown only) -->
          <div v-if="selectedType === 'countdown'" class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-sm">Quick Presets</div>
            <div class="row q-col-gutter-sm">
              <div
                v-for="preset in TIMER_PRESETS"
                :key="preset.label"
                class="col-4"
              >
                <q-btn
                  :label="preset.label"
                  color="warning"
                  text-color="white"
                  unelevated
                  @click="applyPreset(preset)"
                  class="full-width"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <!-- Countdown Duration Input -->
          <div v-if="selectedType === 'countdown'" class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-sm">Duration</div>
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-input
                  v-model.number="hours"
                  type="number"
                  min="0"
                  max="23"
                  suffix="h"
                  outlined
                  dense
                  input-class="text-center"
                  input-style="font-family: var(--font-mono); font-variant-numeric: tabular-nums;"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model.number="minutes"
                  type="number"
                  min="0"
                  max="59"
                  suffix="m"
                  outlined
                  dense
                  input-class="text-center"
                  input-style="font-family: var(--font-mono); font-variant-numeric: tabular-nums;"
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model.number="seconds"
                  type="number"
                  min="0"
                  max="59"
                  suffix="s"
                  outlined
                  dense
                  input-class="text-center"
                  input-style="font-family: var(--font-mono); font-variant-numeric: tabular-nums;"
                />
              </div>
            </div>
          </div>

          <!-- Pomodoro Settings -->
          <div v-if="selectedType === 'pomodoro'">
            <div class="text-caption text-grey-7 q-mb-sm">Pomodoro Settings</div>
            <q-item>
              <q-item-section>
                <q-item-label>Work Duration</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input
                  v-model.number="pomodoroWorkMinutes"
                  type="number"
                  min="1"
                  max="60"
                  suffix="min"
                  outlined
                  dense
                  style="width: 100px"
                  input-class="text-center"
                  input-style="font-family: var(--font-mono); font-variant-numeric: tabular-nums;"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Break Duration</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input
                  v-model.number="pomodoroBreakMinutes"
                  type="number"
                  min="1"
                  max="30"
                  suffix="min"
                  outlined
                  dense
                  style="width: 100px"
                  input-class="text-center"
                  input-style="font-family: var(--font-mono); font-variant-numeric: tabular-nums;"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Auto-start breaks</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="autoStartBreaks" color="warning" />
              </q-item-section>
            </q-item>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn label="Cancel" flat @click="handleClose" />
        <q-btn
          label="Create & Start"
          color="warning"
          unelevated
          :disable="!isValid"
          @click="handleCreate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
.create-timer-card {
  max-width: 512px;
  width: 100%;
}
</style>
