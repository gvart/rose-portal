<template>
  <div class="kanban-board-pwa">
    <!-- Edge Drop Zones -->
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

    <!-- TODO Section -->
    <div ref="todoSectionRef" class="kanban-section">
      <div class="kanban-section-header" @click="toggleSection('TODO')">
        <div class="kanban-section-title">
          <QIcon name="list" size="20px" color="#6B7280" />
          <h2>To Do</h2>
          <QBadge :label="todoChores.length" color="grey-6" />
        </div>
        <QIcon
          :name="sectionCollapsed.TODO ? 'expand_more' : 'expand_less'"
          size="24px"
          color="#6B7280"
        />
      </div>
      <div v-show="!sectionCollapsed.TODO" class="kanban-section-content">
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
          <QIcon name="check_circle" size="48px" color="#D1D5DB" />
          <p>No tasks to do</p>
        </div>
      </div>
    </div>

    <!-- IN_PROGRESS Section -->
    <div ref="inProgressSectionRef" class="kanban-section">
      <div class="kanban-section-header" @click="toggleSection('IN_PROGRESS')">
        <div class="kanban-section-title">
          <QIcon name="play_arrow" size="20px" color="#3B82F6" />
          <h2>In Progress</h2>
          <QBadge :label="inProgressChores.length" color="blue" />
        </div>
        <QIcon
          :name="sectionCollapsed.IN_PROGRESS ? 'expand_more' : 'expand_less'"
          size="24px"
          color="#3B82F6"
        />
      </div>
      <div v-show="!sectionCollapsed.IN_PROGRESS" class="kanban-section-content">
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
          <p>No tasks in progress</p>
        </div>
      </div>
    </div>

    <!-- DONE Section -->
    <div ref="doneSectionRef" class="kanban-section">
      <div class="kanban-section-header" @click="toggleSection('DONE')">
        <div class="kanban-section-title">
          <QIcon name="check_circle" size="20px" color="#10B981" />
          <h2>Done</h2>
          <QBadge :label="doneChores.length" color="green" />
        </div>
        <QIcon
          :name="sectionCollapsed.DONE ? 'expand_more' : 'expand_less'"
          size="24px"
          color="#10B981"
        />
      </div>
      <div v-show="!sectionCollapsed.DONE" class="kanban-section-content">
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
          <QIcon name="pending" size="48px" color="#D1D5DB" />
          <p>No completed tasks</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

// Refs for sections
const todoSectionRef = ref<HTMLElement | null>(null);
const inProgressSectionRef = ref<HTMLElement | null>(null);
const doneSectionRef = ref<HTMLElement | null>(null);

// State
const draggedChoreId = ref<number | null>(null);
const draggedChoreStatus = ref<ChoreStatus | null>(null);
const currentDragPosition = ref({ x: 0, y: 0 });
const activeEdge = ref<'top' | 'bottom' | 'left' | 'right' | null>(null);
const sectionCollapsed = ref({
  TODO: false,
  IN_PROGRESS: false,
  DONE: false,
});

// Edge detection threshold
const EDGE_THRESHOLD = 60; // px from edge

// Throttle drag events
let lastDragMoveTime = 0;
const DRAG_THROTTLE = 16; // ~60fps

function toggleSection(section: 'TODO' | 'IN_PROGRESS' | 'DONE'): void {
  sectionCollapsed.value[section] = !sectionCollapsed.value[section];
}

function handleDragStart(choreId: number): void {
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

  currentDragPosition.value = { x, y };

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

    // Auto-scroll to target section
    scrollToSection(targetStatus);
  } catch (err) {
    error('Failed to update task');
    vibrate('light');
  }

  resetDragState();
}

function resetDragState(): void {
  draggedChoreId.value = null;
  draggedChoreStatus.value = null;
  activeEdge.value = null;
  currentDragPosition.value = { x: 0, y: 0 };
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

function scrollToSection(status: ChoreStatus): void {
  let targetRef: HTMLElement | null = null;

  switch (status) {
    case ChoreStatus.TODO:
      targetRef = todoSectionRef.value;
      break;
    case ChoreStatus.IN_PROGRESS:
      targetRef = inProgressSectionRef.value;
      break;
    case ChoreStatus.DONE:
      targetRef = doneSectionRef.value;
      break;
  }

  if (targetRef) {
    setTimeout(() => {
      targetRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';

// Need to get props for template
export default defineComponent({
  name: 'KanbanBoardPWA',
});
</script>

<style scoped lang="scss">
.kanban-board-pwa {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.kanban-section {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.kanban-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  min-height: 44px; // Touch target

  &:active {
    background: #F9FAFB;
  }
}

.kanban-section-title {
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
}

.kanban-section-content {
  padding: 16px;
  min-height: 100px;
}

.kanban-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #9CA3AF;

  p {
    margin: 12px 0 0 0;
    font-size: 0.875rem;
  }
}
</style>
