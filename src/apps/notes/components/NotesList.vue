<template>
  <div ref="listContainerRef" class="notes-list">
    <div class="notes-list__header">
      <button class="create-note-btn" @click="$emit('create')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        New Note
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && notes.length === 0" class="notes-list__skeleton">
      <NoteCardSkeleton v-for="i in 5" :key="i" />
    </div>

    <!-- Empty state -->
    <div v-else-if="notes.length === 0" class="notes-list__empty">
      <EmptyNotesState @create="$emit('create')" />
    </div>

    <!-- Notes list -->
    <div v-else class="notes-list__items">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :selected="note.id === selectedId"
        @click="$emit('select', note.id)"
        @delete="$emit('delete', $event)"
      />

      <!-- Load more indicator -->
      <div v-if="hasMore" class="load-more-indicator">
        <div class="spinner"></div>
        <span>Loading more...</span>
      </div>

      <!-- End message -->
      <div v-else-if="notes.length > 0" class="end-message">
        No more notes
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'
import NoteCard from './NoteCard.vue'
import NoteCardSkeleton from './NoteCardSkeleton.vue'
import EmptyNotesState from './EmptyNotesState.vue'
import type { Note } from '../types/notes'

defineProps<{
  notes: Note[]
  selectedId: number | null
  loading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  select: [id: number]
  create: []
  loadMore: []
  delete: [id: number]
}>()

const listContainerRef = ref<HTMLElement | null>(null)

useInfiniteScroll(listContainerRef, {
  threshold: 300,
  onLoadMore: () => emit('loadMore')
})
</script>

<style scoped>
.notes-list {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.notes-list__header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.create-note-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.create-note-btn:hover {
  background-color: #7c3aed;
}

.create-note-btn:active {
  transform: scale(0.98);
}

.notes-list__skeleton,
.notes-list__empty,
.notes-list__items {
  flex: 1;
}

.load-more-indicator,
.end-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #6b7280;
  font-size: 14px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.end-message {
  font-style: italic;
}
</style>
