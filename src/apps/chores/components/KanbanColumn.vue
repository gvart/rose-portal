<template>
  <div class="kanban-column">
    <!-- Column Header -->
    <div class="kanban-column-header" :style="{ borderColor: color }">
      <h2 class="kanban-column-title">{{ title }}</h2>
      <span class="kanban-column-count">{{ chores.length }}</span>
    </div>

    <!-- Drop Zone -->
    <div :class="['kanban-column-content', { 'kanban-column-dragover': isDragOver }]">
      <!-- Chore Cards -->
      <draggable
        v-if="!loading && chores.length > 0"
        v-model="choresList"
        item-key="id"
        tag="div"
        class="kanban-column-cards"
        :group="isDragEnabled ? 'chores' : { name: 'chores', pull: false, put: false }"
        :animation="150"
        :delay="50"
        :delay-on-touch-only="false"
        :force-fallback="false"
        :scroll-sensitivity="100"
        :scroll-speed="15"
        ghost-class="chore-card-ghost"
        drag-class="chore-card-dragging"
        chosen-class="chore-card-chosen"
        @start="handleDragStart"
        @end="handleDragEnd"
        @change="handleDragChange"
        @move="handleDragMove"
      >
        <template #item="{ element }">
          <ChoreCard
            :chore="element"
            :can-edit="canEdit(element)"
            @click="$emit('select-chore', element)"
            @long-press="$emit('long-press', element)"
          />
        </template>
      </draggable>

      <!-- Loading Skeletons -->
      <div v-else-if="loading" class="kanban-column-cards">
        <ChoreCardSkeleton v-for="i in 3" :key="i" />
      </div>

      <!-- Empty State with Draggable Drop Zone -->
      <div v-else class="kanban-column-empty-wrapper">
        <draggable
          v-model="choresList"
          item-key="id"
          tag="div"
          class="kanban-column-empty-draggable"
          :group="isDragEnabled ? 'chores' : { name: 'chores', pull: false, put: false }"
          :animation="150"
          ghost-class="chore-card-ghost"
          drag-class="chore-card-dragging"
          chosen-class="chore-card-chosen"
          @start="handleDragStart"
          @end="handleDragEnd"
          @change="handleDragChange"
          @move="handleDragMove"
        >
          <template #item="{ element }">
            <ChoreCard
              :chore="element"
              :can-edit="canEdit(element)"
              @click="$emit('select-chore', element)"
              @long-press="$emit('long-press', element)"
            />
          </template>
        </draggable>

        <div class="kanban-column-empty">
          <svg
            class="kanban-column-empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="status === ChoreStatus.TODO"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
            <path
              v-else-if="status === ChoreStatus.IN_PROGRESS"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="kanban-column-empty-title">{{ emptyStateTitle }}</p>
          <p class="kanban-column-empty-subtitle">{{ emptyStateSubtitle }}</p>
        </div>
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
import draggable from 'vuedraggable'
import ChoreCard from './ChoreCard.vue'
import ChoreCardSkeleton from './ChoreCardSkeleton.vue'
import { ChoreStatus, canEditChore, type Chore } from '../types/chores'
import { useChoresStore } from '../stores/choresStore'
import { useHapticFeedback } from '@/composables/useHapticFeedback'
import { usePWA } from '@/composables/usePWA'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

interface Props {
  status: ChoreStatus
  title: string
  chores: Chore[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  color: string
  columnBg?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  drop: [choreId: number, newStatus: ChoreStatus]
  'select-chore': [chore: Chore]
  'load-more': []
  'long-press': [chore: Chore]
}>()

const store = useChoresStore()
const { vibrate } = useHapticFeedback()
const { isInstalled } = usePWA()
const { isDesktop } = useDeviceDetection()
const isDragOver = ref(false)
const isDragging = ref(false)

const isMobile = computed(() => {
  return window.innerWidth < 768
})

// Enable drag-and-drop on desktop (both web and PWA)
const isDragEnabled = computed(() => {
  return isDesktop.value
})

// Create a local copy of chores for v-model binding
const choresList = computed({
  get: () => props.chores,
  set: () => {
    // Don't allow direct mutation, changes are handled by @change event
  }
})

function canEdit(chore: Chore): boolean {
  const userId = store.currentUserId
  return userId !== null && canEditChore(chore, userId)
}

// Empty state messages
const emptyStateTitle = computed(() => {
  switch (props.status) {
    case ChoreStatus.TODO:
      return 'No tasks yet'
    case ChoreStatus.IN_PROGRESS:
      return 'Nothing in progress'
    case ChoreStatus.DONE:
      return 'No completed tasks'
    default:
      return 'No chores'
  }
})

const emptyStateSubtitle = computed(() => {
  switch (props.status) {
    case ChoreStatus.TODO:
      return 'Create a new task to get started'
    case ChoreStatus.IN_PROGRESS:
      return 'Drag a task here to start working'
    case ChoreStatus.DONE:
      return 'Complete tasks to see them here'
    default:
      return ''
  }
})

function handleDragStart(): void {
  isDragging.value = true
  isDragOver.value = false
  vibrate('medium')
}

function handleDragEnd(): void {
  isDragging.value = false
  isDragOver.value = false
  vibrate('light')
}

function handleDragMove(event: any): void {
  // Show visual feedback when dragging over this column
  if (event.to !== event.from) {
    isDragOver.value = true
  } else {
    isDragOver.value = false
  }
  return true // Allow the move
}

function handleDragChange(event: any): void {
  isDragOver.value = false

  // Handle when a card is added to this column
  if (event.added) {
    const choreId = event.added.element.id
    emit('drop', choreId, props.status)
  }
}
</script>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  background: v-bind('columnBg || "#f9fafb"');
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
  overflow-x: hidden;
  min-height: 200px;
  transition: background-color 0.2s ease;
}

.kanban-column-dragover {
  background: #dbeafe;
}

.kanban-column-cards {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.kanban-column-empty-wrapper {
  position: relative;
  min-height: 300px;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kanban-column-empty-draggable {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
}

.kanban-column-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8, 2rem) var(--space-4, 1rem);
  text-align: center;
  gap: var(--space-3, 12px);
  flex: 1;
  pointer-events: none;
  position: relative;
  z-index: 0;
}

.kanban-column-empty-icon {
  width: var(--space-12, 48px);
  height: var(--space-12, 48px);
  color: var(--color-text-faint, #9ca3af);
}

.kanban-column-empty-title {
  font-size: var(--font-size-16, 16px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-secondary, #475569);
  margin: 0;
}

.kanban-column-empty-subtitle {
  font-size: var(--font-size-13, 13px);
  color: var(--color-text-muted, #64748b);
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
    margin-bottom: 0;
  }

  .kanban-column-content {
    max-height: none;
    overflow-y: visible;
    min-height: 100px; /* Generous drop target on mobile */
    padding: 0;
  }
}

/* Drag & Drop Visual Feedback */
/* Chosen state - mouse down / about to drag */
.kanban-column :deep(.chore-card-chosen) {
  border: 2px solid var(--color-accent-primary, #3B82F6) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

/* Dragging state - card being dragged */
.kanban-column :deep(.chore-card-dragging) {
  transform: rotate(3deg);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
  cursor: grabbing !important;
  z-index: 9999;
}

/* Ghost - placeholder in original position */
.kanban-column :deep(.chore-card-ghost) {
  opacity: 0.3;
  border: 2px dashed var(--color-border-secondary, #CBD5E1) !important;
  background: var(--color-bg-tertiary, #F1F5F9) !important;
}

/* Enhanced drag-over state for columns */
.kanban-column-dragover {
  background: rgba(59, 130, 246, 0.08);
  border-radius: 0.5rem;
  position: relative;
}

.kanban-column-dragover::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px dashed #3B82F6;
  border-radius: 0.5rem;
  pointer-events: none;
  animation: drop-zone-pulse 1.5s ease-in-out infinite;
}

@keyframes drop-zone-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
}
</style>
