<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">
              {{ mode === 'create' ? 'Create Chore' : 'Edit Chore' }}
            </h2>
            <button class="modal-close" @click="close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Title -->
            <div class="form-group">
              <label for="chore-title" class="form-label">
                Title <span class="form-required">*</span>
              </label>
              <input
                id="chore-title"
                v-model="localFormData.title"
                type="text"
                class="form-input"
                :class="{ 'form-input-error': errors.title }"
                placeholder="Enter chore title"
                maxlength="255"
              />
              <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="chore-description" class="form-label">Description</label>
              <ChoreDescriptionEditor
                v-model="localFormData.description"
                placeholder="Add details about this chore..."
              />
            </div>

            <!-- Priority -->
            <div class="form-group">
              <label class="form-label">Priority</label>
              <div class="priority-buttons">
                <button
                  v-for="priority in priorities"
                  :key="priority.value"
                  type="button"
                  :class="[
                    'priority-button',
                    {
                      'priority-button-active': localFormData.priority === priority.value
                    }
                  ]"
                  :style="{
                    '--priority-color': priority.color,
                    '--priority-bg': priority.bgColor,
                    '--priority-text': priority.textColor
                  }"
                  @click="localFormData.priority = priority.value"
                >
                  {{ priority.label }}
                </button>
              </div>
            </div>

            <!-- Due Date -->
            <div class="form-group">
              <label for="chore-due-date" class="form-label">Due Date</label>
              <input
                id="chore-due-date"
                v-model="dueDateString"
                type="date"
                class="form-input"
              />
            </div>

            <!-- Assigned To (Edit mode only) -->
            <AssignmentSelector
              v-if="mode === 'edit'"
              v-model="localFormData.assignedToId"
              :users="availableUsers"
            />
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button
              type="button"
              class="modal-button modal-button-secondary"
              @click="close"
            >
              Cancel
            </button>
            <button
              v-if="mode === 'edit' && canDelete"
              type="button"
              class="modal-button modal-button-danger"
              :disabled="loading"
              @click="handleDelete"
            >
              Delete
            </button>
            <button
              type="button"
              class="modal-button modal-button-primary"
              :disabled="loading || !isValid"
              @click="handleSave"
            >
              {{ loading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AssignmentSelector from './AssignmentSelector.vue'
import ChoreDescriptionEditor from './ChoreDescriptionEditor.vue'
import type { ChoreFormData, ModalMode, User, Chore } from '../types/chores'
import { PRIORITY_CONFIGS } from '../types/chores'

interface Props {
  modelValue: boolean
  mode: ModalMode
  formData: ChoreFormData
  selectedChore: Chore | null
  availableUsers: User[]
  loading: boolean
  canDelete: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [formData: ChoreFormData]
  delete: []
}>()

const localFormData = ref<ChoreFormData>({ ...props.formData })
const errors = ref<Record<string, string>>({})

const priorities = computed(() => Object.values(PRIORITY_CONFIGS))

const dueDateString = computed({
  get: () => {
    const date = localFormData.value.dueDate
    return date.toISOString().split('T')[0]
  },
  set: (value: string) => {
    localFormData.value.dueDate = new Date(value)
  }
})

const isValid = computed(() => {
  return localFormData.value.title.trim().length > 0
})

watch(
  () => props.formData,
  (newData) => {
    localFormData.value = { ...newData }
    errors.value = {}
  },
  { deep: true }
)

function validate(): boolean {
  errors.value = {}

  if (!localFormData.value.title.trim()) {
    errors.value.title = 'Title is required'
    return false
  }

  if (localFormData.value.title.length > 255) {
    errors.value.title = 'Title must be 255 characters or less'
    return false
  }

  return true
}

function handleSave(): void {
  if (!validate()) return
  emit('save', localFormData.value)
}

function handleDelete(): void {
  if (confirm('Are you sure you want to delete this chore? This action cannot be undone.')) {
    emit('delete')
  }
}

function close(): void {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.modal-close {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #EC4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.form-input-error {
  border-color: #ef4444;
}

.form-error {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #ef4444;
}

.priority-buttons {
  display: flex;
  gap: 0.5rem;
}

.priority-button {
  flex: 1;
  padding: 0.75rem;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-button:hover {
  border-color: #9ca3af;
}

.priority-button-active {
  background: var(--priority-bg);
  border-color: var(--priority-color);
  color: var(--priority-text);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.modal-button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-button-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.modal-button-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.modal-button-danger {
  background: #ef4444;
  color: white;
}

.modal-button-danger:hover:not(:disabled) {
  background: #dc2626;
}

.modal-button-primary {
  background: #EC4899;
  color: white;
}

.modal-button-primary:hover:not(:disabled) {
  background: #db2777;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .priority-buttons {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-button {
    width: 100%;
  }
}
</style>
