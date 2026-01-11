<template>
  <div class="kanban-board">
    <!-- TO DO Column -->
    <KanbanColumn
      :status="ChoreStatus.TODO"
      title="To Do"
      :chores="todoChores"
      :loading="loading && todoChores.length === 0"
      :loading-more="todoPagination.loading"
      :has-more="todoPagination.hasMore"
      color="#6B7280"
      @drop="handleDrop"
      @select-chore="handleSelectChore"
      @load-more="handleLoadMore(ChoreStatus.TODO)"
    />

    <!-- IN PROGRESS Column -->
    <KanbanColumn
      :status="ChoreStatus.IN_PROGRESS"
      title="In Progress"
      :chores="inProgressChores"
      :loading="loading && inProgressChores.length === 0"
      :loading-more="inProgressPagination.loading"
      :has-more="inProgressPagination.hasMore"
      color="#3B82F6"
      @drop="handleDrop"
      @select-chore="handleSelectChore"
      @load-more="handleLoadMore(ChoreStatus.IN_PROGRESS)"
    />

    <!-- DONE Column -->
    <KanbanColumn
      :status="ChoreStatus.DONE"
      title="Done"
      :chores="doneChores"
      :loading="loading && doneChores.length === 0"
      :loading-more="donePagination.loading"
      :has-more="donePagination.hasMore"
      color="#10B981"
      @drop="handleDrop"
      @select-chore="handleSelectChore"
      @load-more="handleLoadMore(ChoreStatus.DONE)"
    />
  </div>
</template>

<script setup lang="ts">
import KanbanColumn from './KanbanColumn.vue'
import type { Chore, PaginationState } from '../types/chores'
import { ChoreStatus } from '../types/chores'
import type { ChoreStatus as ChoreStatusType } from '../types/chores'

interface Props {
  todoChores: Chore[]
  inProgressChores: Chore[]
  doneChores: Chore[]
  loading: boolean
  todoPagination: PaginationState
  inProgressPagination: PaginationState
  donePagination: PaginationState
}

defineProps<Props>()

const emit = defineEmits<{
  'status-change': [choreId: number, newStatus: ChoreStatusType]
  'select-chore': [chore: Chore]
  'load-more': [status: ChoreStatusType]
}>()

function handleDrop(choreId: number, newStatus: ChoreStatusType): void {
  emit('status-change', choreId, newStatus)
}

function handleSelectChore(chore: Chore): void {
  emit('select-chore', chore)
}

function handleLoadMore(status: ChoreStatusType): void {
  emit('load-more', status)
}
</script>

<style scoped>
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  height: 100%;
  padding: 1rem 0;
}

@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
    gap: 1rem;
    height: auto;
  }
}
</style>
