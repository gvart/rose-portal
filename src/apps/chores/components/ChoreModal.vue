<template>
  <PwaModal
    :model-value="modelValue"
    @update:model-value="val => $emit('update:modelValue', val)"
    :show-submit="true"
    :can-submit="isValid"
    :loading="loading"
    @submit="handleSave"
    @close="close"
  >
    <template #title>
      {{ mode === 'create' ? 'Create Chore' : 'Edit Chore' }}
    </template>

    <div class="modal-two-column">
      <!-- Main Content Area -->
      <div class="modal-main">
        <!-- Title -->
        <div class="input-section">
          <q-input
            v-model="localFormData.title"
            placeholder="Chore title"
            maxlength="255"
            outlined
            dense
            input-class="text-subtitle1 text-weight-medium"
            :error="!!errors.title"
            :error-message="errors.title"
            :readonly="isPi5"
            @click="isPi5 && handleTitleFocus()"
          />
        </div>

        <!-- Description -->
        <div class="input-section">
          <label class="input-label">Description</label>
          <ChoreDescriptionEditor
            v-model="localFormData.description"
            placeholder="Add details about this chore..."
            :compact="true"
            @focus="isPi5 && handleDescriptionFocus()"
          />
        </div>
      </div>

      <!-- Details Sidebar -->
      <div class="modal-sidebar">
        <!-- Priority -->
        <div class="input-section">
          <label class="input-label">Priority</label>
          <PrioritySegmentedControl v-model="localFormData.priority" dense />
        </div>

        <!-- Due Date -->
        <div class="input-section">
          <label class="input-label">Due Date</label>
          <VueDatePicker
            v-model="localFormData.dueDate"
            :enable-time-picker="false"
            format="MMM dd, yyyy"
            auto-apply
            :teleport="true"
          >
            <template #dp-input="{ value }">
              <q-input
                :model-value="value"
                readonly
                outlined
                dense
                placeholder="Select date"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" />
                </template>
              </q-input>
            </template>
          </VueDatePicker>
        </div>

        <!-- Assigned To (Edit mode only) -->
        <AssignmentSelector
          v-if="mode === 'edit'"
          v-model="localFormData.assignedToId"
          :users="availableUsers"
          dense
        />
      </div>
    </div>

    <template #footer v-if="mode === 'edit' && canDelete">
      <q-btn
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useDeviceDetection } from '@/composables/useDeviceDetection'
import PwaModal from '@/components/common/PwaModal.vue'
import FloatingKeyboard from '@/components/common/FloatingKeyboard.vue'
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
const showKeyboard = ref(false)
const activeField = ref<'title' | 'description'>('title')
const { isPi5 } = useDeviceDetection()

const isValid = computed(() => {
  return localFormData.value.title.trim().length > 0
})

// Unified keyboard value - switches between title and description
const keyboardValue = computed({
  get: () => {
    if (activeField.value === 'title') {
      return localFormData.value.title
    } else {
      // Strip HTML for description on Pi5
      const div = document.createElement('div')
      div.innerHTML = localFormData.value.description
      return div.textContent || div.innerText || ''
    }
  },
  set: (value: string) => {
    if (activeField.value === 'title') {
      localFormData.value.title = value
    } else {
      localFormData.value.description = value
    }
  }
})

function handleTitleFocus() {
  activeField.value = 'title'
  showKeyboard.value = true
}

function handleDescriptionFocus() {
  activeField.value = 'description'
  showKeyboard.value = true
}

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
/* Mobile: Single column */
.modal-two-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Mobile-specific optimizations for phones */
@media (max-width: 768px) {
  .modal-two-column {
    gap: 12px !important;
  }

  .modal-sidebar {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }

  .input-section {
    gap: 4px !important;
  }
}

/* Desktop: Side by side */
@media (min-width: 768px) {
  .modal-two-column {
    flex-direction: row;
  }

  .modal-sidebar {
    width: 240px;
    padding: var(--space-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    border: var(--depth-1-border);
  }
}

.modal-main {
  flex: 1;
  min-width: 0;
}

/* Ultra-compact optimizations for Pi5 */
@media (max-height: 768px) {
  /* Force two-column on landscape small displays */
  .modal-two-column {
    flex-direction: row !important;
  }

  /* Narrower sidebar */
  .modal-sidebar {
    width: 200px !important;
    gap: 8px !important;
    padding: var(--space-3) !important;
  }

  /* Compact date picker */
  .q-input--dense {
    font-size: 12px !important;
  }
}
</style>
