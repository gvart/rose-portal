<template>
  <div
    class="note-card"
    :class="{ 'note-card--selected': selected }"
    @click="$emit('click')"
  >
    <div class="note-card__content">
      <div class="note-card__header">
        <h3 class="note-card__title">{{ note.name || 'Untitled' }}</h3>
        <button class="delete-btn" @click.stop="handleDelete" title="Delete note">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3"/>
          </svg>
        </button>
      </div>

      <div class="note-card__footer">
        <div v-if="note.tags.length > 0" class="note-card__tags">
          <TagChip v-for="tag in note.tags" :key="tag.id" :tag="tag" />
        </div>
        <span class="note-card__date">{{ formattedDate }}</span>
      </div>
    </div>

    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Note?"
      message="This note will be permanently deleted. This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Note } from '../types/notes'
import TagChip from './TagChip.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps<{
  note: Note
  selected: boolean
}>()

const emit = defineEmits<{
  click: []
  delete: [id: number]
}>()

const showDeleteConfirm = ref(false)

function handleDelete() {
  showDeleteConfirm.value = true
}

function confirmDelete() {
  emit('delete', props.note.id)
}

const formattedDate = computed(() => {
  const date = props.note.updatedAt
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? 'Just now' : `${minutes}m ago`
    }
    return `${hours}h ago`
  }

  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  // Format as date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})
</script>

<style scoped>
.note-card {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.note-card:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.note-card--selected {
  background-color: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #8b5cf6;
}

.note-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.note-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.note-card__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.delete-btn:hover,
.delete-btn:active {
  background-color: rgba(239, 68, 68, 0.2);
  color: #dc2626;
  transform: scale(1.05);
}

.note-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.note-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.note-card__date {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
