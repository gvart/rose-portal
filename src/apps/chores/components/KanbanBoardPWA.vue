<template>
  <div class="kanban-board-pwa-wrapper">
    <!-- Edge Drop Zones (shown during drag) -->
    <EdgeDropZone
      edge="top"
      :target-status="ChoreStatus.IN_PROGRESS"
      :active="activeEdge === 'top'"
    />
    <EdgeDropZone
      edge="bottom"
      :target-status="ChoreStatus.DONE"
      :active="activeEdge === 'bottom'"
    />
    <EdgeDropZone
      edge="left"
      :target-status="ChoreStatus.TODO"
      :active="activeEdge === 'left'"
    />
    <EdgeDropZone
      edge="right"
      :target-status="ChoreStatus.IN_PROGRESS"
      :active="activeEdge === 'right'"
    />

    <!-- Swipeable Columns using QCarousel -->
    <QCarousel
      v-model="activeSlide"
      :swipeable="!isDragging"
      animated
      navigation
      padding
      transition-prev="slide-right"
      transition-next="slide-left"
      control-color="primary"
      navigation-position="bottom"
      class="kanban-carousel"
    >
      <!-- TODO Slide -->
      <QCarouselSlide name="TODO" class="kanban-slide">
        <div class="kanban-column">
          <div class="kanban-column-header todo-header">
            <div class="kanban-column-title-row">
              <QIcon name="list" size="20px" color="#6B7280" />
              <h2 class="kanban-column-title">To Do</h2>
              <QBadge :label="todoChores.length" color="grey-6" />
            </div>
          </div>
          <div class="kanban-column-content">
            <ChoreCardPWA
              v-for="chore in todoChores"
              :key="chore.id"
              :chore="chore"
              :can-edit="true"
              @click="emit('select-chore', chore)"
              @drag-start="handleDragStart"
              @drag-move="handleDragMove"
              @drag-end="handleDragEnd"
            />
            <div v-if="todoChores.length === 0" class="kanban-empty">
              <QIcon name="assignment" size="48px" color="#D1D5DB" />
              <p class="kanban-empty-title">No tasks yet</p>
              <p class="kanban-empty-subtitle">Create a new task to get started</p>
            </div>
          </div>
        </div>
      </QCarouselSlide>

      <!-- IN_PROGRESS Slide -->
      <QCarouselSlide name="IN_PROGRESS" class="kanban-slide">
        <div class="kanban-column">
          <div class="kanban-column-header in-progress-header">
            <div class="kanban-column-title-row">
              <QIcon name="play_arrow" size="20px" color="#3B82F6" />
              <h2 class="kanban-column-title">In Progress</h2>
              <QBadge :label="inProgressChores.length" color="blue" />
            </div>
          </div>
          <div class="kanban-column-content">
            <ChoreCardPWA
              v-for="chore in inProgressChores"
              :key="chore.id"
              :chore="chore"
              :can-edit="true"
              @click="emit('select-chore', chore)"
              @drag-start="handleDragStart"
              @drag-move="handleDragMove"
              @drag-end="handleDragEnd"
            />
            <div v-if="inProgressChores.length === 0" class="kanban-empty">
              <QIcon name="schedule" size="48px" color="#D1D5DB" />
              <p class="kanban-empty-title">Nothing in progress</p>
              <p class="kanban-empty-subtitle">Long-press a task and drag to edge to start</p>
            </div>
          </div>
        </div>
      </QCarouselSlide>

      <!-- DONE Slide -->
      <QCarouselSlide name="DONE" class="kanban-slide">
        <div class="kanban-column">
          <div class="kanban-column-header done-header">
            <div class="kanban-column-title-row">
              <QIcon name="check_circle" size="20px" color="#10B981" />
              <h2 class="kanban-column-title">Done</h2>
              <QBadge :label="doneChores.length" color="green" />
            </div>
          </div>
          <div class="kanban-column-content">
            <ChoreCardPWA
              v-for="chore in doneChores"
              :key="chore.id"
              :chore="chore"
              :can-edit="true"
              @click="emit('select-chore', chore)"
              @drag-start="handleDragStart"
              @drag-move="handleDragMove"
              @drag-end="handleDragEnd"
            />
            <div v-if="doneChores.length === 0" class="kanban-empty">
              <QIcon name="celebration" size="48px" color="#D1D5DB" />
              <p class="kanban-empty-title">No completed tasks</p>
              <p class="kanban-empty-subtitle">Complete tasks to see them here</p>
            </div>
          </div>
        </div>
      </QCarouselSlide>
    </QCarousel>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ChoreCardPWA from './ChoreCardPWA.vue';
import EdgeDropZone from './EdgeDropZone.vue';
import type { Chore } from '../types/chores';
import { ChoreStatus } from '../types/chores';
import { useHapticFeedback } from '@/composables/useHapticFeedback';
import { useToast } from '@/composables/useToast';

interface Props {
  todoChores: Chore[];
  inProgressChores: Chore[];
  doneChores: Chore[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'status-change': [choreId: number, newStatus: ChoreStatus];
  'select-chore': [chore: Chore];
}>();

const { vibrate } = useHapticFeedback();
const { success, error } = useToast();

// Active carousel slide
const activeSlide = ref<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

// Drag state
const draggedChoreId = ref<number | null>(null);
const draggedChoreStatus = ref<ChoreStatus | null>(null);
const activeEdge = ref<'top' | 'bottom' | 'left' | 'right' | null>(null);
const isDragging = ref(false);

// Edge detection threshold
const EDGE_THRESHOLD = 60; // px from edge

// Throttle drag events
let lastDragMoveTime = 0;
const DRAG_THROTTLE = 16; // ~60fps

function handleDragStart(choreId: number): void {
  isDragging.value = true;
  draggedChoreId.value = choreId;

  // Find the chore to get its status
  const chore =
    props.todoChores.find(c => c.id === choreId) ||
    props.inProgressChores.find(c => c.id === choreId) ||
    props.doneChores.find(c => c.id === choreId);

  draggedChoreStatus.value = chore?.status || null;
  activeEdge.value = null;
}

function handleDragMove({ x, y }: { x: number; y: number; choreId: number }): void {
  // Throttle drag events
  const now = Date.now();
  if (now - lastDragMoveTime < DRAG_THROTTLE) {
    return;
  }
  lastDragMoveTime = now;

  // Detect which edge we're near
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let detectedEdge: 'top' | 'bottom' | 'left' | 'right' | null = null;

  // Check edges in priority order
  if (y <= EDGE_THRESHOLD) {
    detectedEdge = 'top';
  } else if (y >= windowHeight - EDGE_THRESHOLD) {
    detectedEdge = 'bottom';
  } else if (x <= EDGE_THRESHOLD) {
    detectedEdge = 'left';
  } else if (x >= windowWidth - EDGE_THRESHOLD) {
    detectedEdge = 'right';
  }

  // Only activate edge if it's a valid transition
  if (detectedEdge && isValidTransition(draggedChoreStatus.value, detectedEdge)) {
    activeEdge.value = detectedEdge;
  } else {
    activeEdge.value = null;
  }
}

function handleDragEnd(choreId: number): void {
  if (!activeEdge.value || !draggedChoreStatus.value) {
    // Reset state
    resetDragState();
    return;
  }

  // Determine target status based on edge
  const targetStatus = getTargetStatus(activeEdge.value);

  if (!targetStatus || targetStatus === draggedChoreStatus.value) {
    // Invalid or same status
    vibrate('light');
    resetDragState();
    return;
  }

  // Update status
  try {
    emit('status-change', choreId, targetStatus);

    // Success feedback
    vibrate('heavy');
    success(`Task moved to ${getStatusLabel(targetStatus)}`);

    // Navigate to target column after status change
    navigateToColumn(targetStatus);
  } catch (err) {
    error('Failed to update task');
    vibrate('light');
  }

  resetDragState();
}

function resetDragState(): void {
  isDragging.value = false;
  draggedChoreId.value = null;
  draggedChoreStatus.value = null;
  activeEdge.value = null;
}

function isValidTransition(
  currentStatus: ChoreStatus | null,
  edge: 'top' | 'bottom' | 'left' | 'right'
): boolean {
  if (!currentStatus) return false;

  const validTransitions: Record<ChoreStatus, string[]> = {
    [ChoreStatus.TODO]: ['right'], // TODO → IN_PROGRESS
    [ChoreStatus.IN_PROGRESS]: ['left', 'bottom'], // IN_PROGRESS → TODO or DONE
    [ChoreStatus.DONE]: ['top'], // DONE → IN_PROGRESS
  };

  return validTransitions[currentStatus]?.includes(edge) || false;
}

function getTargetStatus(edge: 'top' | 'bottom' | 'left' | 'right'): ChoreStatus | null {
  const edgeToStatus: Record<string, ChoreStatus> = {
    top: ChoreStatus.IN_PROGRESS,
    bottom: ChoreStatus.DONE,
    left: ChoreStatus.TODO,
    right: ChoreStatus.IN_PROGRESS,
  };

  return edgeToStatus[edge] || null;
}

function getStatusLabel(status: ChoreStatus): string {
  const labels: Record<ChoreStatus, string> = {
    [ChoreStatus.TODO]: 'To Do',
    [ChoreStatus.IN_PROGRESS]: 'In Progress',
    [ChoreStatus.DONE]: 'Done',
  };

  return labels[status] || '';
}

function navigateToColumn(status: ChoreStatus): void {
  // Map status to slide name and navigate
  const statusToSlide: Record<ChoreStatus, 'TODO' | 'IN_PROGRESS' | 'DONE'> = {
    [ChoreStatus.TODO]: 'TODO',
    [ChoreStatus.IN_PROGRESS]: 'IN_PROGRESS',
    [ChoreStatus.DONE]: 'DONE',
  };

  setTimeout(() => {
    activeSlide.value = statusToSlide[status];
  }, 100);
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'KanbanBoardPWA',
});
</script>

<style scoped lang="scss">
.kanban-board-pwa-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.kanban-carousel {
  flex: 1;
  background: transparent;
  height: 100%;

  :deep(.q-carousel__slide) {
    padding: 0;
  }

  :deep(.q-carousel__navigation) {
    bottom: calc(var(--safe-bottom, 0px) + 80px);
  }

  :deep(.q-carousel__navigation-inner) {
    gap: 12px;
    padding: 8px 16px;
    background: white;
    border-radius: 999px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :deep(.q-carousel__navigation-icon) {
    width: 10px;
    height: 10px;
    opacity: 0.4;
    transition: all 0.2s ease;

    &.q-carousel__navigation-icon--active {
      opacity: 1;
      transform: scale(1.3);
    }
  }
}

.kanban-slide {
  padding: 0 8px;
  overflow: hidden;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #F9FAFB;
  border-radius: 12px;
  overflow: hidden;
}

.kanban-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-bottom: 3px solid;
}

.todo-header {
  border-color: #6B7280;
}

.in-progress-header {
  border-color: #3B82F6;
}

.done-header {
  border-color: #10B981;
}

.kanban-column-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kanban-column-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kanban-column-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.kanban-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.kanban-empty-title {
  margin: 16px 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #6B7280;
}

.kanban-empty-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #9CA3AF;
}

/* Scrollbar styling */
.kanban-column-content::-webkit-scrollbar {
  width: 4px;
}

.kanban-column-content::-webkit-scrollbar-track {
  background: transparent;
}

.kanban-column-content::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 2px;
}
</style>
