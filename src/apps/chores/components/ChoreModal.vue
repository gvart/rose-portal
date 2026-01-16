<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card class="chore-modal-card">
      <q-card-section class="modal-header">
        <div class="text-h6">
          {{ mode === 'create' ? 'Create Chore' : 'Edit Chore' }}
        </div>
        <q-btn icon="close" flat round dense @click="close" />
      </q-card-section>

      <q-card-section class="modal-content">
        <div class="modal-layout">
          <!-- Main Content Area (Left Column on Desktop) -->
          <div class="content-main">
              <!-- Title -->
              <div class="form-group">
                <q-input
                  v-model="localFormData.title"
                  placeholder="Chore title"
                  maxlength="255"
                  borderless
                  input-class="text-h6 text-weight-medium"
                  :error="!!errors.title"
                  :error-message="errors.title"
                />
              </div>

              <!-- Description -->
              <div class="form-group">
                <label for="chore-description" class="form-label">Description</label>
                <ChoreDescriptionEditor
                  v-model="localFormData.description"
                  placeholder="Add details about this chore..."
                />
              </div>
            </div>

            <!-- Details Sidebar (Right Column on Desktop) -->
            <div class="content-sidebar">
              <!-- Priority -->
              <div class="form-group">
                <label class="form-label">Priority</label>
                <PrioritySegmentedControl v-model="localFormData.priority" />
              </div>

              <!-- Due Date -->
              <div class="form-group">
                <label class="form-label">Due Date</label>
                <VueDatePicker
                  v-model="localFormData.dueDate"
                  :enable-time-picker="false"
                  format="MMM dd, yyyy"
                  auto-apply
                  :teleport="true"
                >
                  <template #dp-input="{ value }">
                    <div class="date-picker-input">
                      {{ value }}
                    </div>
                  </template>
                </VueDatePicker>
              </div>

              <!-- Assigned To (Edit mode only) -->
              <AssignmentSelector
                v-if="mode === 'edit'"
                v-model="localFormData.assignedToId"
                :users="availableUsers"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn label="Cancel" flat @click="close" />
        <q-btn
          v-if="mode === 'edit' && canDelete"
          label="Delete"
          color="negative"
          flat
          :disable="loading"
          @click="handleDelete"
        />
        <q-btn
          :label="loading ? 'Saving...' : 'Save'"
          color="primary"
          unelevated
          :disable="loading || !isValid"
          :loading="loading"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import AssignmentSelector from './AssignmentSelector.vue'
import ChoreDescriptionEditor from './ChoreDescriptionEditor.vue'
import PrioritySegmentedControl from './PrioritySegmentedControl.vue'
import type { ChoreFormData, ModalMode, User, Chore } from '../types/chores'

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
.chore-modal-card {
  max-width: 56rem;
  width: 100%;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-content {
  overflow-y: auto;
}

.modal-layout {
  display: flex;
  gap: 2rem;
}

.content-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 0;
}

.content-main .form-group:last-child,
.content-sidebar .form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.date-picker-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.date-picker-input:hover {
  border-color: #9ca3af;
}

/* Desktop sidebar styling */
@media (min-width: 769px) {
  .content-sidebar {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
  }

  .content-sidebar .form-group {
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .content-sidebar .form-group:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .content-main,
  .content-sidebar {
    width: 100%;
  }

  .content-sidebar {
    gap: 1rem;
  }

  .form-group {
    margin-bottom: 0;
  }

  .content-main .form-group {
    gap: 1rem;
  }

  .content-sidebar .form-group {
    gap: 1rem;
  }

  .form-label {
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    text-transform: none;
    letter-spacing: normal;
  }
}
</style>
