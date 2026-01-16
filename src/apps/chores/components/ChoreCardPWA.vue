<template>
  <div
    ref="cardRef"
    :class="['chore-card-pwa-wrapper', { 'is-dragging': isDragging }]"
    :style="cardStyle"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <q-card
      :class="['chore-card-pwa', { 'chore-card-pwa-dragging': isDragging }]"
      :style="{ '--priority-color': priorityColor }"
    >
      <q-card-section>
        <!-- Title and Priority -->
        <div class="chore-card-header">
          <h3 class="chore-card-title">{{ chore.title }}</h3>
          <PriorityBadge :priority="chore.priority" size="sm" />
        </div>

        <!-- Description with Markdown -->
        <MarkdownRenderer
          v-if="chore.description"
          class="chore-card-description"
          :markdown="chore.description"
          :max-lines="2"
        />

        <!-- Due Date with Visual Warnings -->
        <div class="chore-card-meta">
          <div v-if="overdueStatus" :class="['chore-card-due', overdueStatus.class]">
            <q-icon name="schedule" size="16px" />
            <span>{{ overdueStatus.text }}</span>
          </div>

          <!-- Assigned User -->
          <div class="chore-card-assignee">
            <q-icon name="person" size="16px" />
            <span>{{ chore.assignedTo?.username || 'Unassigned' }}</span>
          </div>
        </div>

        <!-- Completion Info (DONE only) -->
        <div v-if="chore.completedAt && chore.completedBy" class="chore-card-completion">
          <q-icon name="check_circle" size="16px" />
          <span>
            Completed by {{ chore.completedBy.username }} on {{ formatCompletedDate }}
          </span>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import PriorityBadge from './PriorityBadge.vue';
import MarkdownRenderer from './MarkdownRenderer.vue';
import type { Chore } from '../types/chores';
import { isOverdue, isDueSoon, formatDueDate, ChoreStatus, PRIORITY_CONFIGS } from '../types/chores';
import { useHapticFeedback } from '@/composables/useHapticFeedback';

interface Props {
  chore: Chore;
  canEdit: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [];
  'drag-start': [choreId: number];
  'drag-move': [{ x: number; y: number; choreId: number }];
  'drag-end': [choreId: number];
}>();

const { vibrate } = useHapticFeedback();

const cardRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragPosition = ref({ x: 0, y: 0 });
let longPressTimer: NodeJS.Timeout | null = null;
let startX = 0;
let startY = 0;
let initialCardRect: DOMRect | null = null;
const LONG_PRESS_DURATION = 500; // ms
const MOVEMENT_THRESHOLD = 10; // px
let hasMoved = false;

// Priority color for left border
const priorityColor = computed(() => {
  return PRIORITY_CONFIGS[props.chore.priority].color;
});

const overdueStatus = computed(() => {
  if (props.chore.status === ChoreStatus.DONE) {
    return null;
  }

  if (isOverdue(props.chore)) {
    return {
      text: `Overdue - ${formatDueDate(props.chore.dueDate)}`,
      class: 'chore-card-due-overdue',
    };
  }

  if (isDueSoon(props.chore)) {
    return {
      text: `Due soon - ${formatDueDate(props.chore.dueDate)}`,
      class: 'chore-card-due-soon',
    };
  }

  return {
    text: `Due ${formatDueDate(props.chore.dueDate)}`,
    class: 'chore-card-due-normal',
  };
});

const formatCompletedDate = computed(() => {
  if (!props.chore.completedAt) return '';
  return props.chore.completedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
});

const cardStyle = computed(() => {
  if (!isDragging.value) {
    return {};
  }

  return {
    position: 'fixed' as const,
    left: `${dragPosition.value.x}px`,
    top: `${dragPosition.value.y}px`,
    width: initialCardRect ? `${initialCardRect.width}px` : 'auto',
    zIndex: 10000,
    pointerEvents: 'none' as const,
  };
});

function handleTouchStart(event: TouchEvent): void {
  const touch = event.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  hasMoved = false;

  if (cardRef.value) {
    initialCardRect = cardRef.value.getBoundingClientRect();
  }

  // Start long press timer
  longPressTimer = setTimeout(() => {
    activateDragMode(touch);
  }, LONG_PRESS_DURATION);
}

function handleTouchMove(event: TouchEvent): void {
  const touch = event.touches[0];
  const deltaX = Math.abs(touch.clientX - startX);
  const deltaY = Math.abs(touch.clientY - startY);

  // If dragging, update position and emit event
  if (isDragging.value) {
    event.preventDefault(); // Prevent scrolling while dragging

    if (initialCardRect) {
      dragPosition.value = {
        x: touch.clientX - initialCardRect.width / 2,
        y: touch.clientY - initialCardRect.height / 2,
      };
    }

    emit('drag-move', {
      x: touch.clientX,
      y: touch.clientY,
      choreId: props.chore.id,
    });
    return;
  }

  // Cancel long press if user moves finger too much before drag activates
  if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
    hasMoved = true;
    cancelLongPress();
  }
}

function handleTouchEnd(event: TouchEvent): void {
  if (isDragging.value) {
    event.preventDefault();
    deactivateDragMode();
    return;
  }

  cancelLongPress();

  // Only emit click if no movement and not dragging
  if (!hasMoved && props.canEdit) {
    emit('click');
  }
}

function handleTouchCancel(): void {
  if (isDragging.value) {
    deactivateDragMode();
  }
  cancelLongPress();
}

function activateDragMode(touch: Touch): void {
  isDragging.value = true;
  hasMoved = true;

  // Haptic feedback
  vibrate('medium');

  if (initialCardRect) {
    dragPosition.value = {
      x: touch.clientX - initialCardRect.width / 2,
      y: touch.clientY - initialCardRect.height / 2,
    };
  }

  emit('drag-start', props.chore.id);
}

function deactivateDragMode(): void {
  isDragging.value = false;
  dragPosition.value = { x: 0, y: 0 };
  initialCardRect = null;
  emit('drag-end', props.chore.id);
}

function cancelLongPress(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}
</script>

<style scoped lang="scss">
.chore-card-pwa-wrapper {
  position: relative;
  margin-bottom: 12px;
  user-select: none;
  -webkit-user-select: none;
  max-width: 100%;
  overflow: hidden;
  transition: opacity 0.15s ease;

  &.is-dragging {
    opacity: 0.9;
  }
}

.chore-card-pwa {
  border-left: 4px solid var(--priority-color);
  border: 1px solid #e5e7eb;
  border-left: 4px solid var(--priority-color);
  border-radius: 8px;
  background: white;
  position: relative;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  will-change: transform;
  touch-action: none;

  &:active {
    transform: scale(0.98);
  }
}

.chore-card-pwa-dragging {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0.95;
}

.chore-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.chore-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.chore-card-description {
  margin: 0 0 12px 0;
}

.chore-card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.chore-card-due,
.chore-card-assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.chore-card-due-overdue {
  color: #dc2626;
  font-weight: 600;
}

.chore-card-due-soon {
  color: #f59e0b;
  font-weight: 600;
}

.chore-card-due-normal {
  color: #6b7280;
}

.chore-card-assignee {
  color: #6b7280;
}

.chore-card-completion {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #10b981;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}
</style>
