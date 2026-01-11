<template>
  <div class="kanban-column">
    <!-- Column Header -->
    <div class="kanban-column-header" :style="{ borderColor: color }">
      <h2 class="kanban-column-title">{{ title }}</h2>
      <span class="kanban-column-count">{{ chores.length }}</span>
    </div>

    <!-- Drop Zone -->
    <div
      :class="['kanban-column-content', { 'kanban-column-dragover': isDragOver }]"
      @dragover.prevent="handleDragOver"
      @drop="handleDrop"
      @dragleave="handleDragLeave"
    >
      <!-- Chore Cards -->
      <div v-if="!loading && chores.length > 0" class="kanban-column-cards">
        <ChoreCard
          v-for="chore in chores"
          :key="chore.id"
          :chore="chore"
          :draggable="!isMobile"
          :can-edit="canEdit(chore)"
          @click="$emit('select-chore', chore)"
          @dragstart="isDragging = true"
          @dragend="isDragging = false"
        />
      </div>

      <!-- Loading Skeletons -->
      <div v-else-if="loading" class="kanban-column-cards">
        <ChoreCardSkeleton v-for="i in 3" :key="i" />
      </div>

      <!-- Empty State -->
      <div v-else class="kanban-column-empty">
        <svg
          class="kanban-column-empty-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p class="kanban-column-empty-text">No chores</p>
      </div>

      <!-- Load More Button -->
      <button
        v-if="!loading && hasMore && chores.length > 0"
        class="kanban-column-load-more"
        :disabled="loadingMore"
        @click="$emit('load-more')"
      >
        <span v-if="loadingMore">Loading...</span>
        <span v-else>Load More</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ChoreCard from './ChoreCard.vue'
import ChoreCardSkeleton from './ChoreCardSkeleton.vue'
import type { Chore, ChoreStatus } from '../types/chores'
import { canEditChore } from '../types/chores'
import { useChoresStore } from '../stores/choresStore'

interface Props {
  status: ChoreStatus
  title: string
  chores: Chore[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  color: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  drop: [choreId: number, newStatus: ChoreStatus]
  'select-chore': [chore: Chore]
  'load-more': []
}>()

const store = useChoresStore()
const isDragOver = ref(false)
const isDragging = ref(false)

const isMobile = computed(() => {
  return window.innerWidth < 768
})

function canEdit(chore: Chore): boolean {
  const userId = store.currentUserId
  return userId !== null && canEditChore(chore, userId)
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(): void {
  isDragOver.value = false
}

function handleDrop(event: DragEvent): void {
  event.preventDefault()
  isDragOver.value = false

  if (!event.dataTransfer) return

  const choreIdStr = event.dataTransfer.getData('choreId')
  if (!choreIdStr) return

  const choreId = parseInt(choreIdStr, 10)
  if (!isNaN(choreId)) {
    emit('drop', choreId, props.status)
  }
}
</script>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.kanban-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-bottom: 3px solid;
}

.kanban-column-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kanban-column-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background: #e5e7eb;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 9999px;
}

.kanban-column-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  min-height: 200px;
  transition: background-color 0.2s ease;
}

.kanban-column-dragover {
  background: #dbeafe;
}

.kanban-column-cards {
  display: flex;
  flex-direction: column;
}

.kanban-column-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

.kanban-column-empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.75rem;
}

.kanban-column-empty-text {
  font-size: 0.875rem;
  margin: 0;
}

.kanban-column-load-more {
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.kanban-column-load-more:hover:not(:disabled) {
  border-color: #9ca3af;
  background: #f9fafb;
}

.kanban-column-load-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar styling */
.kanban-column-content::-webkit-scrollbar {
  width: 0.5rem;
}

.kanban-column-content::-webkit-scrollbar-track {
  background: transparent;
}

.kanban-column-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 9999px;
}

.kanban-column-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 768px) {
  .kanban-column {
    margin-bottom: 1rem;
  }

  .kanban-column-content {
    max-height: none;
    overflow-y: visible;
  }
}
</style>
