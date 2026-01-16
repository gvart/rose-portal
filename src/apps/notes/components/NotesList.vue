<template>
  <div ref="listContainerRef" class="notes-list">
    <!-- Pull-to-refresh indicator -->
    <div
      v-if="pullState !== 'idle'"
      class="pull-indicator"
      :style="{ height: `${pullDistance}px` }"
    >
      <div v-if="pullState === 'pulling'" class="pull-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      <div v-else-if="pullState === 'ready'" class="pull-icon pull-icon--ready">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div v-else-if="pullState === 'refreshing'" class="pull-icon">
        <div class="pull-spinner"></div>
      </div>
      <div v-else-if="pullState === 'complete'" class="pull-icon pull-icon--complete">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <div class="notes-list__header">
      <q-btn
        label="New Note"
        icon="add"
        color="primary"
        unelevated
        class="full-width"
        @click="$emit('create')"
      />
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
        @long-press="handleLongPress(note)"
        @menu="handleMenuClick(note)"
      />

      <!-- Load more indicator -->
      <div v-if="hasMore" class="load-more-indicator">
        <q-spinner color="primary" size="16px" />
        <span>Loading more...</span>
      </div>
    </div>

    <!-- Context Menu -->
    <NoteContextMenu
      v-model="showContextMenu"
      :note="selectedContextNote"
      @open="handleOpenNote"
      @delete="handleDeleteNote"
    />

    <!-- Delete Confirmation Dialog -->
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
import { ref } from 'vue'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import NoteCard from './NoteCard.vue'
import NoteCardSkeleton from './NoteCardSkeleton.vue'
import EmptyNotesState from './EmptyNotesState.vue'
import NoteContextMenu from './NoteContextMenu.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
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
  refresh: []
}>()

const listContainerRef = ref<HTMLElement | null>(null)

// Pull-to-refresh
const { pullState, pullDistance } = usePullToRefresh(
  listContainerRef,
  {
    threshold: 80,
    onRefresh: async () => {
      emit('refresh')
    }
  }
)

// Context menu state
const showContextMenu = ref(false)
const selectedContextNote = ref<Note | null>(null)

// Delete confirmation state
const showDeleteConfirm = ref(false)
const noteToDelete = ref<number | null>(null)

function handleLongPress(note: Note) {
  selectedContextNote.value = note
  showContextMenu.value = true
}

function handleMenuClick(note: Note) {
  selectedContextNote.value = note
  showContextMenu.value = true
}

function handleOpenNote() {
  if (selectedContextNote.value) {
    emit('select', selectedContextNote.value.id)
  }
}

function handleDeleteNote() {
  if (selectedContextNote.value) {
    noteToDelete.value = selectedContextNote.value.id
    showDeleteConfirm.value = true
  }
}

function confirmDelete() {
  if (noteToDelete.value !== null) {
    emit('delete', noteToDelete.value)
    noteToDelete.value = null
  }
}

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

.notes-list__skeleton,
.notes-list__empty,
.notes-list__items {
  flex: 1;
}

.load-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #6b7280;
  font-size: 14px;
}

/* Pull-to-refresh indicator */
.pull-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: height 0.2s ease;
}

.pull-icon {
  color: #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.pull-icon--ready {
  animation: pulse 1s ease-in-out infinite;
}

.pull-icon--complete svg {
  color: #10b981;
}

.pull-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pull-spinner,
  .pull-icon,
  .pull-indicator {
    transition: none !important;
    animation: none !important;
  }
}
</style>
