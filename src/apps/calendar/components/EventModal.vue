<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card class="event-modal-card">
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="text-h5">
            {{ mode === 'create' ? 'Create Event' : 'Edit Event' }}
          </div>
          <div v-if="mode === 'edit' && selectedEvent?.createdBy?.name" class="event-meta">
            Created by {{ selectedEvent.createdBy.name }}
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="closeModal" :disable="loading" />
      </q-card-section>

      <q-card-section class="modal-content">
        <!-- Event Name -->
        <div class="input-section">
          <label class="input-label" for="event-name">Event Name</label>
          <q-input
            id="event-name"
            ref="nameInputRef"
            v-model="localFormData.eventName"
            type="text"
            outlined
            placeholder="Enter event name"
            maxlength="100"
            @keydown.enter="handleSave"
          />
        </div>

        <!-- All Day Toggle -->
        <div class="toggle-section">
          <q-toggle
            v-model="localFormData.isAllDay"
            label="All Day Event"
            color="primary"
            size="lg"
          />
        </div>

            <!-- Date/Time Section -->
            <div class="datetime-section">
              <!-- Start -->
              <div class="datetime-group">
                <label class="input-label">Start</label>
                <VueDatePicker
                  v-model="startDateTime"
                  :enable-time-picker="!localFormData.isAllDay"
                  :format="localFormData.isAllDay ? 'MMM dd, yyyy' : 'MMM dd, yyyy hh:mm a'"
                  auto-apply
                  :teleport="true"
                >
                  <template #dp-input="{ value }">
                    <div class="datetime-display">
                      {{ value }}
                    </div>
                  </template>
                </VueDatePicker>
              </div>

              <!-- End -->
              <div class="datetime-group">
                <label class="input-label">End</label>
                <VueDatePicker
                  v-model="endDateTime"
                  :enable-time-picker="!localFormData.isAllDay"
                  :format="localFormData.isAllDay ? 'MMM dd, yyyy' : 'MMM dd, yyyy hh:mm a'"
                  auto-apply
                  :teleport="true"
                >
                  <template #dp-input="{ value }">
                    <div class="datetime-display">
                      {{ value }}
                    </div>
                  </template>
                </VueDatePicker>
              </div>
            </div>

            <!-- Color Selection -->
            <div class="input-section">
              <label class="input-label">Color</label>
              <div class="color-picker">
                <button
                  v-for="color in colorOptions"
                  :key="color.id"
                 
                  type="button"
                  class="color-option"
                  :class="{
                    'color-option--selected': localFormData.color === color.id,
                    [color.dot]: true
                  }"
                  @click="localFormData.color = color.id"
                  :aria-label="`Select ${color.name} color`"
                  :title="color.name"
                >
                  <svg
                    v-if="localFormData.color === color.id"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="3"
                    stroke="currentColor"
                    class="check-icon"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </button>
              </div>
            </div>

        <!-- Reminder Time Selection -->
        <div class="input-section">
          <label class="input-label">Reminder</label>
          <q-select
            v-model="localFormData.reminderTime"
            :options="reminderTimeOptions"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            outlined
          />
        </div>

        <!-- Validation Errors -->
        <q-banner v-if="attemptedSubmit && validationErrors.length > 0" rounded dense class="bg-negative text-white">
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          <div
            v-for="(error, idx) in validationErrors"
            :key="idx"
            class="q-mb-xs"
          >
            {{ error }}
          </div>
        </q-banner>

      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <!-- Delete Button (Edit mode only) -->
        <q-btn
          v-if="mode === 'edit'"
          icon="delete"
          label="Delete"
          color="negative"
          flat
          :disable="loading"
          @click="handleDelete"
        />

        <q-space />

        <q-btn
          label="Cancel"
          flat
          :disable="loading"
          @click="closeModal"
        />

        <q-btn
          :label="loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Save')"
          color="primary"
          unelevated
          :disable="!isValid || loading"
          :loading="loading"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Delete Confirmation Dialog -->
  <q-dialog v-model="showDeleteConfirm">
    <q-card class="confirm-dialog-card">
      <q-card-section>
        <div class="text-h6">Delete Event?</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Are you sure you want to delete "{{ selectedEvent?.eventName }}"?
        This action cannot be undone.
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Cancel" flat @click="showDeleteConfirm = false" />
        <q-btn label="Delete" color="negative" unelevated @click="confirmDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { CalendarEvent, EventFormData, EventColor, ModalMode, ReminderTime } from '../types/calendar'
import { EVENT_COLORS, REMINDER_TIME_OPTIONS } from '../types/calendar'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps<{
  modelValue: boolean
  mode: ModalMode
  formData: EventFormData
  selectedEvent: CalendarEvent | null
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:formData': [data: EventFormData]
  'save': [data: EventFormData]
  'delete': []
}>()

// ============================================================================
// State
// ============================================================================

const nameInputRef = ref<HTMLInputElement | null>(null)
const showDeleteConfirm = ref(false)
const attemptedSubmit = ref(false)

// Local copy of form data for editing
const localFormData = ref<EventFormData>({ ...props.formData })

// Color options from constants
const colorOptions = Object.values(EVENT_COLORS)

// Reminder time options from constants
const reminderTimeOptions = REMINDER_TIME_OPTIONS

// ============================================================================
// Computed
// ============================================================================

/**
 * Start date/time for VueDatePicker
 */
const startDateTime = computed({
  get: () => {
    if (localFormData.value.isAllDay) {
      return localFormData.value.startDate
    }
    const [hours, minutes] = localFormData.value.startTime.split(':').map(Number)
    const date = new Date(localFormData.value.startDate)
    date.setHours(hours, minutes, 0, 0)
    return date
  },
  set: (value: Date | null) => {
    if (!value) return
    localFormData.value.startDate = value
    if (!localFormData.value.isAllDay) {
      localFormData.value.startTime = formatTimeForInput(value)
    }
  }
})

/**
 * End date/time for VueDatePicker
 */
const endDateTime = computed({
  get: () => {
    if (localFormData.value.isAllDay) {
      return localFormData.value.endDate
    }
    const [hours, minutes] = localFormData.value.endTime.split(':').map(Number)
    const date = new Date(localFormData.value.endDate)
    date.setHours(hours, minutes, 0, 0)
    return date
  },
  set: (value: Date | null) => {
    if (!value) return
    localFormData.value.endDate = value
    if (!localFormData.value.isAllDay) {
      localFormData.value.endTime = formatTimeForInput(value)
    }
  }
})

/**
 * Validation errors
 */
const validationErrors = computed<string[]>(() => {
  const errors: string[] = []

  if (!localFormData.value.eventName.trim()) {
    errors.push('Event name is required')
  }

  if (localFormData.value.eventName.length > 100) {
    errors.push('Event name must be 100 characters or less')
  }

  // Check end is after start
  const start = getStartDateTime()
  const end = getEndDateTime()

  if (end <= start) {
    errors.push('End time must be after start time')
  }

  return errors
})

/**
 * Form is valid
 */
const isValid = computed(() => validationErrors.value.length === 0)

// ============================================================================
// Watchers
// ============================================================================

// Sync with props when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      localFormData.value = { ...props.formData }
      attemptedSubmit.value = false // Reset validation error display

      // Focus name input after animation
      nextTick(() => {
        setTimeout(() => {
          nameInputRef.value?.focus()
        }, 300)
      })
    }
  }
)

// Update parent when local form changes
watch(
  localFormData,
  (data) => {
    emit('update:formData', { ...data })
  },
  { deep: true }
)

// ============================================================================
// Methods
// ============================================================================

function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function getStartDateTime(): Date {
  if (localFormData.value.isAllDay) {
    const d = new Date(localFormData.value.startDate)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const [hours, minutes] = localFormData.value.startTime.split(':').map(Number)
  const d = new Date(localFormData.value.startDate)
  d.setHours(hours, minutes, 0, 0)
  return d
}

function getEndDateTime(): Date {
  if (localFormData.value.isAllDay) {
    const d = new Date(localFormData.value.endDate)
    d.setHours(23, 59, 59, 999)
    return d
  }

  const [hours, minutes] = localFormData.value.endTime.split(':').map(Number)
  const d = new Date(localFormData.value.endDate)
  d.setHours(hours, minutes, 0, 0)
  return d
}

function closeModal() {
  if (!props.loading) {
    emit('update:modelValue', false)
  }
}

function handleOverlayClick() {
  // Could add unsaved changes warning here
  closeModal()
}

function handleSave() {
  attemptedSubmit.value = true

  if (isValid.value && !props.loading) {
    emit('save', { ...localFormData.value })
  }
}

function handleDelete() {
  showDeleteConfirm.value = true
}

function confirmDelete() {
  showDeleteConfirm.value = false
  emit('delete')
}
</script>

<style scoped>
.event-modal-card {
  max-width: 512px;
  width: 100%;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.event-meta {
  font-size: var(--font-size-13);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.modal-content {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Input Sections */
.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Toggle Section */
.toggle-section {
  padding: var(--space-2) 0;
}

/* DateTime Section */
.datetime-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .datetime-section {
    grid-template-columns: 1fr 1fr;
  }
}

.datetime-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.datetime-display {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  border: var(--depth-1-border);
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: var(--space-11);
  display: flex;
  align-items: center;
}

.datetime-display:active {
  border-color: var(--color-border-focus);
}

/* Color Picker */
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
}

.color-option:active {
  transform: scale(0.96);
}

.color-option--selected {
  border-color: var(--color-text-primary);
  box-shadow: 0 0 0 2px var(--color-border-secondary);
}

.check-icon {
  width: 20px;
  height: 20px;
  color: white;
}

/* Delete Confirmation Dialog */
.confirm-dialog-card {
  max-width: 384px;
  width: 100%;
}

/* Responsive */
@media (max-width: 640px) {
  .datetime-section {
    grid-template-columns: 1fr;
  }
}

/* Tablet responsive */
@media (min-width: 641px) and (max-width: 1024px) {
  .event-modal-card {
    max-width: 672px;
  }
}
</style>
