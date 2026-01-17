<template>
  <PwaModal
    :model-value="modelValue"
    @update:model-value="val => $emit('update:modelValue', val)"
    :show-submit="true"
    :can-submit="isValid"
    :loading="loading"
    @submit="handleSave"
    @close="closeModal"
  >
    <template #title>
      <div>
        {{ mode === 'create' ? 'Create Event' : 'Edit Event' }}
        <div v-if="mode === 'edit' && selectedEvent?.createdBy?.name" class="text-caption text-grey-7" style="font-weight: 400; font-size: 12px; margin-top: 2px;">
          Created by {{ selectedEvent.createdBy.name }}
        </div>
      </div>
    </template>

    <div class="form-grid">
      <!-- Event Name - Full Width -->
      <div class="input-section full-width">
        <label class="input-label">Event Name</label>
        <q-input
          ref="nameInputRef"
          v-model="localFormData.eventName"
          outlined
          dense
          placeholder="Enter event name"
          maxlength="100"
          :readonly="isPi5"
          @click="isPi5 && handleEventNameFocus()"
          @keydown.enter="!isPi5 && handleSave"
        />
      </div>

          <!-- All Day Toggle - Full Width -->
          <div class="toggle-row full-width">
            <label class="input-label">All Day Event</label>
            <q-toggle
              v-model="localFormData.isAllDay"
              color="primary"
            />
          </div>

          <!-- Start Date/Time -->
          <div class="input-section">
            <label class="input-label">Start</label>
            <VueDatePicker
              v-model="startDateTime"
              :enable-time-picker="!localFormData.isAllDay"
              :format="localFormData.isAllDay ? 'MMM dd, yyyy' : 'MMM dd, yyyy hh:mm a'"
              auto-apply
              :teleport="true"
            >
              <template #dp-input="{ value }">
                <q-input
                  :model-value="value"
                  readonly
                  outlined
                  dense
                  placeholder="Select start"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" />
                  </template>
                </q-input>
              </template>
            </VueDatePicker>
          </div>

          <!-- End Date/Time -->
          <div class="input-section">
            <label class="input-label">End</label>
            <VueDatePicker
              v-model="endDateTime"
              :enable-time-picker="!localFormData.isAllDay"
              :format="localFormData.isAllDay ? 'MMM dd, yyyy' : 'MMM dd, yyyy hh:mm a'"
              auto-apply
              :teleport="true"
            >
              <template #dp-input="{ value }">
                <q-input
                  :model-value="value"
                  readonly
                  outlined
                  dense
                  placeholder="Select end"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" />
                  </template>
                </q-input>
              </template>
            </VueDatePicker>
          </div>

          <!-- Color Selection - Full Width -->
          <div class="input-section full-width">
            <label class="input-label">Color</label>
            <div class="color-picker-compact">
              <button
                v-for="color in colorOptions"
                :key="color.id"
                type="button"
                class="color-option"
                :class="{
                  'color-option--selected': localFormData.color === color.id
                }"
                :style="{ backgroundColor: getColorValue(color.id) }"
                @click="localFormData.color = color.id"
                :aria-label="`Select ${color.name} color`"
              >
                <q-icon v-if="localFormData.color === color.id" name="check" size="16px" color="white" />
              </button>
            </div>
          </div>

          <!-- Reminder -->
          <div class="input-section full-width">
            <label class="input-label">Reminder</label>
            <q-select
              v-model="localFormData.reminderTime"
              :options="reminderTimeOptions"
              option-value="id"
              option-label="label"
              emit-value
              map-options
              outlined
              dense
            />
          </div>

      <!-- Validation Errors -->
      <q-banner
        v-if="attemptedSubmit && validationErrors.length > 0"
        rounded
        dense
        class="bg-negative text-white full-width"
      >
        <template v-slot:avatar>
          <q-icon name="error" />
        </template>
        <div v-for="(error, idx) in validationErrors" :key="idx" class="q-mb-xs">
          {{ error }}
        </div>
      </q-banner>
    </div>

    <template #footer v-if="mode === 'edit'">
      <q-btn
        icon="delete"
        label="Delete"
        color="negative"
        flat
        :disable="loading"
        @click="handleDelete"
      />
    </template>
  </PwaModal>

  <!-- On-Screen Keyboard (Pi5 only) -->
  <Teleport to="body">
    <FloatingKeyboard
      v-if="isPi5"
      v-model="keyboardValue"
      v-model:show="showKeyboard"
      :docked="true"
    />
  </Teleport>

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
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import PwaModal from '@/components/common/PwaModal.vue'
import FloatingKeyboard from '@/components/common/FloatingKeyboard.vue'

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
const showKeyboard = ref(false)
const { isPi5 } = useDeviceDetection()

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

/**
 * Keyboard value for Pi5 on-screen keyboard
 */
const keyboardValue = computed({
  get: () => localFormData.value.eventName,
  set: (value: string) => {
    localFormData.value.eventName = value
  }
})

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

/**
 * Handle event name input focus for Pi5 keyboard
 */
function handleEventNameFocus() {
  showKeyboard.value = true
}

/**
 * Get actual color value for inline styles
 */
function getColorValue(colorId: EventColor): string {
  const colorMap: Record<EventColor, string> = {
    indigo: '#6366f1',
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    blue: '#3b82f6',
    purple: '#a855f7',
    pink: '#ec4899'
  }
  return colorMap[colorId]
}
</script>

<style scoped>
.event-modal-card {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.modal-content {
  flex: 1;
  min-height: 0;
  max-height: 60vh;
}

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

/* Compact color picker */
.color-picker-compact {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  /* 44px touch target: 32px visual + 6px padding = 44px */
  padding: 6px;
  background-clip: content-box;
  min-width: 44px;
  min-height: 44px;
}

.color-option:active {
  transform: scale(0.92);
}

.color-option--selected {
  border-color: var(--color-text-primary);
}

/* Delete Confirmation Dialog */
.confirm-dialog-card {
  max-width: 384px;
  width: 100%;
}

/* Ultra-compact optimizations for Pi5 */
@media (max-height: 768px) {
  .event-modal-card.modal-md {
    max-height: 88vh !important;
    max-width: 600px !important;
  }

  /* Compact color picker */
  .color-picker-compact {
    gap: 4px !important;
  }

  .color-option {
    width: 28px !important;
    height: 28px !important;
    /* Maintain 44px touch target even when visual is smaller */
    padding: 8px !important;
  }

  /* Compact reminder dropdown */
  .q-select--dense .q-field__control {
    min-height: 36px !important;
  }

  .modal-content {
    max-height: 70vh;
  }
}
</style>
