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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 50;
}

.modal-container {
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  border-radius: var(--radius-lg);
  max-width: 512px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: var(--depth-2-border);
}

.modal-title {
  font-size: var(--font-size-24);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--space-11);
  min-height: var(--space-11);
  border-radius: var(--radius-sm);
  color: var(--color-text-faint);
  background: transparent;
  border: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.close-button:active {
  transform: scale(0.96);
  background: var(--color-bg-active);
  color: var(--color-text-secondary);
}

.modal-content {
  overflow-y: auto;
  padding: var(--space-6);
  flex: 1;
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

.text-input {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  border: var(--depth-1-border);
  font-size: var(--font-size-14);
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-height: var(--space-11);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Toggle Section */
.toggle-section {
  padding: var(--space-2) 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.toggle-checkbox {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 28px;
  background: var(--color-border-secondary);
  border-radius: var(--radius-full);
  transition: background-color var(--duration-fast) var(--ease-in-out);
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: var(--radius-full);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform var(--duration-fast) var(--ease-in-out);
}

.toggle-checkbox:checked + .toggle-switch {
  background: var(--color-accent-primary);
}

.toggle-checkbox:checked + .toggle-switch::after {
  transform: translateX(20px);
}

.toggle-text {
  font-size: var(--font-size-14);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
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

/* Validation Errors */
.validation-errors {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-error-bg);
  border: 2px solid var(--color-error-border);
  border-radius: var(--radius-sm);
}

.error-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-error-text);
  font-size: var(--font-size-13);
  font-weight: var(--font-weight-medium);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: var(--depth-2-border);
}

.spacer {
  flex: 1;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-14);
  border-radius: var(--radius-md);
  border: none;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;
  min-height: var(--space-11);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:active:not(:disabled) {
  transform: scale(0.96);
}

.btn-secondary {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.btn-secondary:active:not(:disabled) {
  background: var(--color-bg-active);
}

.btn-primary {
  background: var(--color-accent-primary);
  color: white;
}

.btn-primary:active:not(:disabled) {
  background: var(--color-accent-primary-active);
}

.btn-danger {
  background: var(--color-error-bg);
  color: var(--color-error-text);
}

.btn-danger:active:not(:disabled) {
  background: var(--color-error-solid);
  color: white;
}

/* Delete Confirmation Dialog */
.confirm-dialog {
  background: var(--color-bg-primary);
  border: var(--depth-3-border);
  box-shadow: var(--depth-3-shadow);
  border-radius: var(--radius-lg);
  max-width: 384px;
  width: 100%;
  padding: var(--space-6);
}

.confirm-title {
  font-size: var(--font-size-18);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.confirm-text {
  font-size: var(--font-size-14);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

.confirm-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container,
.modal-enter-active .confirm-dialog,
.modal-leave-active .confirm-dialog {
  transition: transform var(--duration-slow) var(--ease-in-out);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container,
.modal-enter-from .confirm-dialog,
.modal-leave-to .confirm-dialog {
  transform: scale(0.96) translateY(var(--space-4));
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-container {
    max-height: 100%;
    height: 100%;
    border-radius: 0;
    max-width: 100%;
  }

  .modal-header {
    padding: var(--space-4);
    position: sticky;
    top: 0;
    background: var(--color-bg-primary);
    z-index: 10;
  }

  .modal-title {
    font-size: var(--font-size-18);
  }

  .modal-content {
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .datetime-section {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-wrap: wrap;
    position: sticky;
    bottom: 0;
    background: var(--color-bg-primary);
    padding: var(--space-4);
    padding-bottom: var(--space-6);
    border-top: var(--depth-2-border);
    margin-left: calc(-1 * var(--space-4));
    margin-right: calc(-1 * var(--space-4));
  }

  .btn {
    flex: 1;
    min-width: 120px;
  }

  .btn-danger {
    width: 100%;
    order: 3;
    margin-top: var(--space-2);
  }

  .spacer {
    display: none;
  }
}

/* Tablet responsive */
@media (min-width: 641px) and (max-width: 1024px) {
  .modal-container {
    max-width: 672px;
  }
}
</style>
