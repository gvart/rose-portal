<template>
  <div class="kanban-board-wrapper">
    <div ref="boardContainer" class="kanban-board" @scroll="handleScroll">
      <!-- TO DO Column -->
    <KanbanColumn
      :status="ChoreStatus.TODO"
      title="To Do"
      :chores="todoChores"
      :loading="loading && todoChores.length === 0"
      :loading-more="todoPagination.loading"
      :has-more="todoPagination.hasMore"
      color="#6B7280"
      column-bg="#F8FAFC"
      @drop="handleDrop"
      @select-chore="handleSelectChore"
      @load-more="handleLoadMore(ChoreStatus.TODO)"
      @swipe-move-next="$emit('swipe-move-next', $event)"
      @swipe-edit="$emit('swipe-edit', $event)"
      @swipe-assign="$emit('swipe-assign', $event)"
      @swipe-delete="$emit('swipe-delete', $event)"
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
      column-bg="#EFF6FF"
      @drop="handleDrop"
      @select-chore="handleSelectChore"
      @load-more="handleLoadMore(ChoreStatus.IN_PROGRESS)"
      @swipe-move-next="$emit('swipe-move-next', $event)"
      @swipe-edit="$emit('swipe-edit', $event)"
      @swipe-assign="$emit('swipe-assign', $event)"
      @swipe-delete="$emit('swipe-delete', $event)"
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
      column-bg="#ECFDF5"
      @drop="handleDrop"
      @select-chore="handleSelectChore"
      @load-more="handleLoadMore(ChoreStatus.DONE)"
      @swipe-move-next="$emit('swipe-move-next', $event)"
      @swipe-edit="$emit('swipe-edit', $event)"
      @swipe-assign="$emit('swipe-assign', $event)"
      @swipe-delete="$emit('swipe-delete', $event)"
    />
    </div>

    <!-- Column indicators (mobile only) -->
    <div v-if="isMobile" class="kanban-indicators">
      <button
        v-for="(column, index) in columns"
        :key="index"
        :class="['indicator-dot', { active: activeColumnIndex === index }]"
        :aria-label="`View ${column.title} column`"
        @click="scrollToColumn(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
  'swipe-move-next': [chore: Chore]
  'swipe-edit': [chore: Chore]
  'swipe-assign': [chore: Chore]
  'swipe-delete': [chore: Chore]
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

// ============================================================================
// Mobile Navigation
// ============================================================================

const boardContainer = ref<HTMLElement | null>(null)
const activeColumnIndex = ref(0)
const isMobile = computed(() => window.innerWidth < 768)

const columns = [
  { title: 'To Do', status: ChoreStatus.TODO },
  { title: 'In Progress', status: ChoreStatus.IN_PROGRESS },
  { title: 'Done', status: ChoreStatus.DONE }
]

function handleScroll(): void {
  if (!isMobile.value || !boardContainer.value) return

  const container = boardContainer.value
  const scrollPosition = container.scrollLeft
  const columnWidth = container.clientWidth

  // Calculate which column is currently in view
  const index = Math.round(scrollPosition / columnWidth)
  activeColumnIndex.value = Math.max(0, Math.min(index, columns.length - 1))
}

function scrollToColumn(index: number): void {
  if (!boardContainer.value) return

  const container = boardContainer.value
  const columnWidth = container.clientWidth

  container.scrollTo({
    left: columnWidth * index,
    behavior: 'smooth'
  })
}

// Handle window resize to recalculate mobile state
let resizeTimeout: NodeJS.Timeout | null = null

function handleResize(): void {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    // Force scroll position update
    if (isMobile.value) {
      handleScroll()
    }
  }, 100)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) clearTimeout(resizeTimeout)
})
</script>

<style scoped>
.kanban-board-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  height: 100%;
  padding: 1rem 0;
  flex: 1;
}

/* Column indicators */
.kanban-indicators {
  position: fixed;
  bottom: calc(var(--safe-bottom, 0px) + var(--space-6, 24px));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--space-3, 12px);
  padding: var(--space-2, 8px);
  background: var(--color-bg-primary, white);
  border: var(--depth-1-border, 1px solid #e2e8f0);
  border-radius: 999px;
  z-index: 30;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.indicator-dot {
  width: var(--space-2, 8px);
  height: var(--space-2, 8px);
  border-radius: 50%;
  background: var(--color-text-faint, #94a3b8);
  opacity: 0.4;
  transition: all var(--duration-fast, 150ms) cubic-bezier(0.25, 1, 0.5, 1);
  border: none;
  cursor: pointer;
  padding: var(--space-2, 8px); /* Larger tap target */
}

.indicator-dot.active {
  background: var(--color-text-primary, #0f172a);
  opacity: 1;
  transform: scale(1.2);
}

.indicator-dot:active {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .kanban-board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    gap: 0;
    padding: 1rem 0 5rem 0; /* Extra bottom padding for indicators */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  /* Hide scrollbar for Chrome, Safari */
  .kanban-board::-webkit-scrollbar {
    display: none;
  }

  .kanban-board :deep(.kanban-column) {
    flex: 0 0 100vw;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    padding: 0 var(--space-4, 16px);
  }
}

@media (min-width: 769px) {
  .kanban-indicators {
    display: none;
  }
}
</style>
