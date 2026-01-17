<template>
  <div
    ref="cardRef"
    :class="['chore-card-pwa-wrapper', { 'is-dragging': isDragging, 'is-swiping': isSwipeMode }]"
    :style="cardStyle"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <!-- Swipe Indicator -->
    <div
      v-if="showSwipeIndicator && swipeDirection"
      :class="['swipe-indicator', `swipe-indicator--${swipeDirection}`]"
    >
      <div class="swipe-indicator-content">
        <q-icon
          :name="getStatusIcon(getTargetStatus(swipeDirection) || ChoreStatus.TODO)"
          size="24px"
          class="swipe-indicator-icon"
        />
        <span class="swipe-indicator-label">
          {{ getStatusLabel(getTargetStatus(swipeDirection) || ChoreStatus.TODO) }}
        </span>
      </div>
    </div>

    <q-card
      :class="['chore-card-pwa', { 'chore-card-pwa-dragging': isDragging, 'chore-card-pwa-swiping': isSwipeMode }]"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
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
  'swipe-status-change': [choreId: number, targetStatus: ChoreStatus];
}>();

const { vibrate } = useHapticFeedback();

const cardRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragPosition = ref({ x: 0, y: 0 });
const swipeOffset = ref(0);
const swipeDirection = ref<'left' | 'right' | null>(null);
const showSwipeIndicator = ref(false);
let longPressTimer: NodeJS.Timeout | null = null;
let startX = 0;
let startY = 0;
let initialCardRect: DOMRect | null = null;
const LONG_PRESS_DURATION = 500; // ms
const MOVEMENT_THRESHOLD = 10; // px
const SWIPE_THRESHOLD = 80; // px distance to trigger status change
const SWIPE_ACTIVATION_THRESHOLD = 20; // px to show indicator
let hasMoved = false;
let isSwipeMode = false;
let hasVibrated = false;

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
  if (isDragging.value) {
    return {
      position: 'fixed' as const,
      left: `${dragPosition.value.x}px`,
      top: `${dragPosition.value.y}px`,
      width: initialCardRect ? `${initialCardRect.width}px` : 'auto',
      zIndex: 10000,
      pointerEvents: 'none' as const,
    };
  }

  if (isSwipeMode && swipeOffset.value !== 0) {
    return {
      transform: `translateX(${swipeOffset.value}px)`,
      transition: 'none',
    };
  }

  return {};
});

// Get valid status transitions based on current status
const validSwipeDirections = computed(() => {
  const { status } = props.chore;
  if (status === ChoreStatus.TODO) return ['right'];
  if (status === ChoreStatus.IN_PROGRESS) return ['left', 'right'];
  if (status === ChoreStatus.DONE) return ['left'];
  return [];
});

// Get target status for swipe direction
function getTargetStatus(direction: 'left' | 'right'): ChoreStatus | null {
  const { status } = props.chore;

  if (status === ChoreStatus.TODO && direction === 'right') {
    return ChoreStatus.IN_PROGRESS;
  }
  if (status === ChoreStatus.IN_PROGRESS) {
    return direction === 'left' ? ChoreStatus.TODO : ChoreStatus.DONE;
  }
  if (status === ChoreStatus.DONE && direction === 'left') {
    return ChoreStatus.IN_PROGRESS;
  }
  return null;
}

// Get status label for display
function getStatusLabel(status: ChoreStatus): string {
  const labels: Record<ChoreStatus, string> = {
    [ChoreStatus.TODO]: 'To Do',
    [ChoreStatus.IN_PROGRESS]: 'In Progress',
    [ChoreStatus.DONE]: 'Done',
  };
  return labels[status] || '';
}

// Get icon for status
function getStatusIcon(status: ChoreStatus): string {
  const icons: Record<ChoreStatus, string> = {
    [ChoreStatus.TODO]: 'list',
    [ChoreStatus.IN_PROGRESS]: 'play_arrow',
    [ChoreStatus.DONE]: 'check_circle',
  };
  return icons[status] || 'arrow_forward';
}

function handleTouchStart(event: TouchEvent): void {
  const touch = event.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  hasMoved = false;
  isSwipeMode = false;
  hasVibrated = false;
  swipeOffset.value = 0;
  swipeDirection.value = null;
  showSwipeIndicator.value = false;

  if (cardRef.value) {
    initialCardRect = cardRef.value.getBoundingClientRect();
  }

  // Start long press timer for drag mode
  longPressTimer = setTimeout(() => {
    activateDragMode(touch);
  }, LONG_PRESS_DURATION);
}

function handleTouchMove(event: TouchEvent): void {
  const touch = event.touches[0];
  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  // If dragging (legacy drag-to-edge mode), update position and emit event
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

  // Detect swipe mode - horizontal swipe dominates vertical
  if (absDeltaX > MOVEMENT_THRESHOLD && absDeltaX > absDeltaY * 1.5) {
    hasMoved = true;
    cancelLongPress();

    const direction: 'left' | 'right' = deltaX < 0 ? 'left' : 'right';

    // Check if this swipe direction is valid for current status
    if (validSwipeDirections.value.includes(direction)) {
      isSwipeMode = true;
      swipeDirection.value = direction;

      // Prevent default to stop scrolling/pull-to-refresh during swipe
      event.preventDefault();

      // Update swipe offset with elastic resistance
      const maxSwipe = 120; // px
      const resistance = 0.6; // resistance factor
      let offset = deltaX * resistance;
      offset = Math.max(-maxSwipe, Math.min(maxSwipe, offset));
      swipeOffset.value = offset;

      // Show indicator when swipe exceeds activation threshold
      if (absDeltaX > SWIPE_ACTIVATION_THRESHOLD) {
        showSwipeIndicator.value = true;

        // Haptic feedback at threshold (debounced - only once per crossing)
        if (absDeltaX >= SWIPE_THRESHOLD && !hasVibrated) {
          vibrate('medium');
          hasVibrated = true;
        } else if (absDeltaX < SWIPE_THRESHOLD && hasVibrated) {
          // Reset flag when user pulls back below threshold
          // Allows re-trigger if they cross again
          hasVibrated = false;
        }
      }
    }
    return;
  }

  // Cancel long press if user moves finger too much before drag activates
  if (absDeltaX > MOVEMENT_THRESHOLD || absDeltaY > MOVEMENT_THRESHOLD) {
    hasMoved = true;
    cancelLongPress();
  }
}

function handleTouchEnd(event: TouchEvent): void {
  // Handle drag mode end (legacy)
  if (isDragging.value) {
    event.preventDefault();
    deactivateDragMode();
    return;
  }

  // Handle swipe mode end
  if (isSwipeMode && swipeDirection.value) {
    const absDelta = Math.abs(swipeOffset.value / 0.6); // Undo resistance calculation

    if (absDelta >= SWIPE_THRESHOLD) {
      // Swipe threshold reached - trigger status change
      const targetStatus = getTargetStatus(swipeDirection.value);

      if (targetStatus) {
        // Emit dedicated swipe status change event
        emit('swipe-status-change', props.chore.id, targetStatus);
        vibrate('heavy');
      }
    } else {
      // Swipe cancelled - provide light feedback
      vibrate('light');
    }

    // Reset swipe state with animation
    resetSwipeState();
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
  if (isSwipeMode) {
    resetSwipeState();
  }
  cancelLongPress();
}

function resetSwipeState(): void {
  // Add transition for smooth return
  if (cardRef.value) {
    cardRef.value.style.transition = 'transform 0.2s ease-out';
  }

  isSwipeMode = false;
  swipeOffset.value = 0;
  swipeDirection.value = null;
  showSwipeIndicator.value = false;

  // Remove transition after animation
  setTimeout(() => {
    if (cardRef.value) {
      cardRef.value.style.transition = '';
    }
  }, 200);
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

// Register touchmove with passive: false for proper preventDefault()
onMounted(() => {
  if (cardRef.value) {
    cardRef.value.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
  }
});

// Cleanup on unmount to prevent memory leaks
onBeforeUnmount(() => {
  cancelLongPress();
  if (cardRef.value) {
    cardRef.value.removeEventListener('touchmove', handleTouchMove as EventListener);
  }
});
</script>

<style scoped lang="scss">
.chore-card-pwa-wrapper {
  position: relative;
  margin-bottom: 12px;
  user-select: none;
  -webkit-user-select: none;
  max-width: 100%;
  overflow: visible;
  transition: opacity 0.15s ease;

  &.is-dragging {
    opacity: 0.9;
  }

  &.is-swiping {
    overflow: visible;
  }
}

// Swipe indicator
.swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: swipe-indicator-fade-in 0.2s ease;

  &--left {
    left: 8px;
  }

  &--right {
    right: 8px;
  }
}

.swipe-indicator-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.swipe-indicator-icon {
  color: #2563EB;
}

.swipe-indicator-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

@keyframes swipe-indicator-fade-in {
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
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
  touch-action: pan-y; // Allow vertical scroll, prevent horizontal

  &:active:not(.chore-card-pwa-swiping) {
    transform: scale(0.98);
  }
}

.chore-card-pwa-swiping {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
