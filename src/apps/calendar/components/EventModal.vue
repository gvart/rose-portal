<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">
              {{ mode === 'create' ? 'Create Event' : 'Edit Event' }}
            </h2>
            <button
              v-haptic:light
              type="button"
              class="close-button"
              @touchend.prevent="closeModal"
              @click.prevent="closeModal"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="modal-content">
            <!-- Event Name -->
            <div class="input-section">
              <label class="input-label" for="event-name">Event Name</label>
              <input
                id="event-name"
                ref="nameInputRef"
                v-model="localFormData.eventName"
                type="text"
                class="text-input"
                placeholder="Enter event name"
                maxlength="100"
                @keydown.enter="handleSave"
              />
            </div>

            <!-- All Day Toggle -->
            <div class="toggle-section">
              <label class="toggle-label">
                <input
                  type="checkbox"
                  v-model="localFormData.isAllDay"
                  class="toggle-checkbox"
                />
                <span class="toggle-switch"></span>
                <span class="toggle-text">All Day Event</span>
              </label>
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
                  v-haptic:light
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

            <!-- Validation Errors -->
            <div v-if="validationErrors.length > 0" class="validation-errors">
              <div
                v-for="(error, idx) in validationErrors"
                :key="idx"
                class="error-item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ error }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <!-- Delete Button (Edit mode only) -->
              <button
                v-if="mode === 'edit'"
                v-haptic:medium
                type="button"
                class="btn btn-danger"
                :disabled="loading"
                @touchend.prevent="handleDelete"
                @click.prevent="handleDelete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>

              <div class="spacer"></div>

              <button
                v-haptic:light
                type="button"
                class="btn btn-secondary"
                :disabled="loading"
                @touchend.prevent="closeModal"
                @click.prevent="closeModal"
              >
                Cancel
              </button>

              <button
                v-haptic:medium
                type="button"
                class="btn btn-primary"
                :disabled="!isValid || loading"
                @touchend.prevent="handleSave"
                @click.prevent="handleSave"
              >
                {{ loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation -->
    <Transition name="modal">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
        <div class="confirm-dialog" @click.stop>
          <h3 class="confirm-title">Delete Event?</h3>
          <p class="confirm-text">
            Are you sure you want to delete "{{ selectedEvent?.eventName }}"?
            This action cannot be undone.
          </p>
          <div class="confirm-actions">
            <button
              v-haptic:light
              class="btn btn-secondary"
              @click="showDeleteConfirm = false"
            >
              Cancel
            </button>
            <button
              v-haptic:medium
              class="btn btn-danger"
              @click="confirmDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { CalendarEvent, EventFormData, EventColor, ModalMode } from '../types/calendar'
import { EVENT_COLORS } from '../types/calendar'
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

// Local copy of form data for editing
const localFormData = ref<EventFormData>({ ...props.formData })

// Color options from constants
const colorOptions = Object.values(EVENT_COLORS)

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
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-container {
  @apply bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b-2 border-gray-200;
}

.modal-title {
  @apply text-2xl font-bold text-gray-800;
}

.close-button {
  @apply flex items-center justify-center w-10 h-10 rounded-lg
         text-gray-500 hover:bg-gray-100 hover:text-gray-700
         transition-all duration-200;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.close-button:active {
  transform: scale(0.95);
}

.modal-content {
  @apply overflow-y-auto p-6 flex-1 space-y-6;
}

/* Input Sections */
.input-section {
  @apply flex flex-col gap-2;
}

.input-label {
  @apply text-base font-semibold text-gray-700;
}

.text-input {
  @apply px-4 py-3 rounded-lg border-2 border-gray-300
         text-lg text-gray-800 focus:outline-none
         focus:border-indigo-500 transition-all duration-200;
  min-height: 52px;
}

.text-input:focus {
  @apply border-indigo-500 bg-indigo-50/30;
}

/* Toggle Section */
.toggle-section {
  @apply py-2;
}

.toggle-label {
  @apply flex items-center gap-3 cursor-pointer;
}

.toggle-checkbox {
  @apply sr-only;
}

.toggle-switch {
  @apply relative w-12 h-7 bg-gray-300 rounded-full transition-colors duration-200;
}

.toggle-switch::after {
  content: '';
  @apply absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow
         transition-transform duration-200;
}

.toggle-checkbox:checked + .toggle-switch {
  @apply bg-indigo-600;
}

.toggle-checkbox:checked + .toggle-switch::after {
  transform: translateX(20px);
}

.toggle-text {
  @apply text-base font-medium text-gray-700;
}

/* DateTime Section */
.datetime-section {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.datetime-group {
  @apply flex flex-col gap-2;
}

.datetime-display {
  @apply w-full px-4 py-3 rounded-lg border-2 border-gray-300
         text-base text-gray-800 bg-white cursor-pointer
         hover:border-indigo-500 transition-all duration-200;
  min-height: 52px;
  display: flex;
  align-items: center;
}

/* Color Picker */
.color-picker {
  @apply flex flex-wrap gap-3;
}

.color-option {
  @apply w-10 h-10 rounded-full flex items-center justify-center
         border-2 border-transparent transition-all duration-150
         hover:scale-110 active:scale-95;
}

.color-option--selected {
  @apply border-gray-800 ring-2 ring-offset-2 ring-gray-400;
}

.check-icon {
  @apply w-5 h-5 text-white;
}

/* Validation Errors */
.validation-errors {
  @apply flex flex-col gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg;
}

.error-item {
  @apply flex items-center gap-2 text-red-700 text-sm font-medium;
}

/* Action Buttons */
.action-buttons {
  @apply flex gap-3 pt-4 border-t-2 border-gray-200;
}

.spacer {
  @apply flex-1;
}

.btn {
  @apply flex items-center justify-center gap-2 py-3 px-5 font-semibold rounded-lg
         transition-all duration-200 disabled:opacity-50
         disabled:cursor-not-allowed;
  min-height: 48px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.btn:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.btn-primary {
  @apply bg-indigo-600 text-white hover:bg-indigo-700;
}

.btn-danger {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

/* Delete Confirmation Dialog */
.confirm-dialog {
  @apply bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6;
}

.confirm-title {
  @apply text-xl font-bold text-gray-800 mb-3;
}

.confirm-text {
  @apply text-gray-600 mb-6;
}

.confirm-actions {
  @apply flex gap-3 justify-end;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container,
.modal-enter-active .confirm-dialog,
.modal-leave-active .confirm-dialog {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container,
.modal-enter-from .confirm-dialog,
.modal-leave-to .confirm-dialog {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    @apply p-0;
  }

  .modal-container {
    @apply max-h-full h-full rounded-none max-w-full;
  }

  .modal-header {
    @apply px-4 py-4 sticky top-0 bg-white z-10;
  }

  .modal-title {
    @apply text-xl;
  }

  .modal-content {
    @apply px-4 py-4 space-y-4;
  }

  .datetime-section {
    @apply grid-cols-1;
  }

  .action-buttons {
    @apply flex-wrap sticky bottom-0 bg-white pt-4 pb-6 border-t-2 -mx-4 px-4;
  }

  .btn {
    @apply flex-1 min-w-[120px];
  }

  .btn-danger {
    @apply w-full order-last mt-2;
  }

  .spacer {
    @apply hidden;
  }
}

/* Tablet responsive */
@media (min-width: 641px) and (max-width: 1024px) {
  .modal-container {
    @apply max-w-2xl;
  }
}
</style>
