<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">Manage Tags</h2>
            <button class="modal-close-btn" @click="close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Create new tag form -->
            <div class="create-tag-form">
              <h3 class="form-title">Create New Tag</h3>
              <div class="form-row">
                <input
                  v-model="newTagName"
                  type="text"
                  class="tag-name-input"
                  placeholder="Tag name"
                  maxlength="50"
                  @keyup.enter="handleCreateTag"
                />
                <div class="color-picker">
                  <button
                    v-for="color in TAG_COLORS"
                    :key="color"
                    class="color-option"
                    :class="{ 'color-option--selected': newTagColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="newTagColor = color"
                  ></button>
                </div>
                <button class="create-tag-btn" @click="handleCreateTag">Create</button>
              </div>
            </div>

            <!-- Existing tags list -->
            <div class="tags-list">
              <h3 class="form-title">Existing Tags</h3>
              <div v-if="tags.length === 0" class="empty-tags">
                No tags yet. Create one above!
              </div>
              <div v-else class="tag-items">
                <div v-for="tag in tags" :key="tag.id" class="tag-item">
                  <div
                    class="tag-item__color"
                    :style="{ backgroundColor: tag.color }"
                  ></div>
                  <input
                    v-model="tag.name"
                    type="text"
                    class="tag-item__name"
                    @blur="handleUpdateTag(tag)"
                  />
                  <button class="tag-item__delete" @click="handleDeleteTag(tag.id)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Tag?"
      message="This tag will be removed from all notes. This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDeleteTag"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Tag } from '../types/notes'
import { TAG_COLORS, type TagColor } from '../types/notes'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps<{
  modelValue: boolean
  tags: Tag[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  create: [data: { name: string; color: TagColor }]
  update: [data: { id: number; name: string; color: string }]
  delete: [id: number]
}>()

const newTagName = ref('')
const newTagColor = ref<TagColor>(TAG_COLORS[0])
const showDeleteConfirm = ref(false)
const tagToDelete = ref<number | null>(null)

function close() {
  emit('update:modelValue', false)
}

function handleCreateTag() {
  if (newTagName.value.trim()) {
    emit('create', {
      name: newTagName.value.trim(),
      color: newTagColor.value
    })
    newTagName.value = ''
    newTagColor.value = TAG_COLORS[0]
  }
}

function handleUpdateTag(tag: Tag) {
  emit('update', {
    id: tag.id,
    name: tag.name,
    color: tag.color
  })
}

function handleDeleteTag(id: number) {
  tagToDelete.value = id
  showDeleteConfirm.value = true
}

function confirmDeleteTag() {
  if (tagToDelete.value !== null) {
    emit('delete', tagToDelete.value)
    tagToDelete.value = null
  }
}

// Reset form when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      newTagName.value = ''
      newTagColor.value = TAG_COLORS[0]
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #6b7280;
}

.modal-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.create-tag-form {
  margin-bottom: 32px;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #374151;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-name-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.tag-name-input:focus {
  border-color: #8b5cf6;
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option--selected {
  border-color: #374151;
  transform: scale(1.15);
}

.create-tag-btn {
  padding: 10px 16px;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.create-tag-btn:hover {
  background-color: #7c3aed;
}

.tags-list {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 24px;
}

.empty-tags {
  text-align: center;
  padding: 32px;
  color: #6b7280;
  font-size: 14px;
}

.tag-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s ease;
}

.tag-item:hover {
  border-color: #8b5cf6;
}

.tag-item__color {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tag-item__name {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.tag-item__name:focus {
  border-color: #8b5cf6;
  background-color: #fafafa;
}

.tag-item__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ef4444;
}

.tag-item__delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
}
</style>
