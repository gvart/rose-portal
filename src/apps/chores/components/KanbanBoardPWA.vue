<template>
  <div class="kanban-board-pwa-wrapper">
    <!-- ARIA live region for accessibility announcements -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ accessibilityAnnouncement }}
    </div>

    <!-- Labeled Tabs for Column Navigation -->
    <q-tabs
      v-model="activeColumnIndex"
      class="kanban-tabs"
      active-color="primary"
      indicator-color="primary"
      narrow-indicator
      dense
      align="justify"
    >
      <q-tab
        :name="0"
        label="To Do"
        :ripple="false"
        class="kanban-tab"
      >
        <q-badge
          v-if="sortedTodoChores.length > 0"
          :label="sortedTodoChores.length"
          color="grey-6"
          class="kanban-tab-badge"
        />
      </q-tab>
      <q-tab
        :name="1"
        label="In Progress"
        :ripple="false"
        class="kanban-tab"
      >
        <q-badge
          v-if="sortedInProgressChores.length > 0"
          :label="sortedInProgressChores.length"
          color="blue"
          class="kanban-tab-badge"
        />
      </q-tab>
      <q-tab
        :name="2"
        label="Done"
        :ripple="false"
        class="kanban-tab"
      >
        <q-badge
          v-if="sortedDoneChores.length > 0"
          :label="sortedDoneChores.length"
          color="green"
          class="kanban-tab-badge"
        />
      </q-tab>
    </q-tabs>

    <!-- Swipeable Columns using QTabPanels -->
    <q-tab-panels
      v-model="activeColumnIndex"
      animated
      swipeable
      transition-prev="slide-right"
      transition-next="slide-left"
      class="kanban-panels"
    >
      <!-- TODO Panel -->
      <q-tab-panel :name="0" class="kanban-panel">
        <div class="kanban-column">
          <div class="kanban-column-content">
            <ChoreCardPWA
              v-for="chore in sortedTodoChores"
              :key="chore.id"
              :chore="chore"
              :can-edit="true"
              @click="emit('select-chore', chore)"
              @swipe-status-change="handleSwipeStatusChange"
            />
            <div v-if="sortedTodoChores.length === 0" class="kanban-empty">
              <q-icon name="assignment" size="48px" color="grey-4" />
              <p class="kanban-empty-title">No tasks yet</p>
              <p class="kanban-empty-subtitle">Create a new task to get started</p>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- IN_PROGRESS Panel -->
      <q-tab-panel :name="1" class="kanban-panel">
        <div class="kanban-column">
          <div class="kanban-column-content">
            <ChoreCardPWA
              v-for="chore in sortedInProgressChores"
              :key="chore.id"
              :chore="chore"
              :can-edit="true"
              @click="emit('select-chore', chore)"
              @swipe-status-change="handleSwipeStatusChange"
            />
            <div v-if="sortedInProgressChores.length === 0" class="kanban-empty">
              <q-icon name="schedule" size="48px" color="grey-4" />
              <p class="kanban-empty-title">Nothing in progress</p>
              <p class="kanban-empty-subtitle">Swipe right on a task to start</p>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- DONE Panel -->
      <q-tab-panel :name="2" class="kanban-panel">
        <div class="kanban-column">
          <div class="kanban-column-content">
            <ChoreCardPWA
              v-for="chore in sortedDoneChores"
              :key="chore.id"
              :chore="chore"
              :can-edit="true"
              @click="emit('select-chore', chore)"
              @swipe-status-change="handleSwipeStatusChange"
            />
            <div v-if="sortedDoneChores.length === 0" class="kanban-empty">
              <q-icon name="celebration" size="48px" color="grey-4" />
              <p class="kanban-empty-title">No completed tasks</p>
              <p class="kanban-empty-subtitle">Complete tasks to see them here</p>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ChoreCardPWA from './ChoreCardPWA.vue';
import type { Chore } from '../types/chores';
import { ChoreStatus, ChorePriority } from '../types/chores';
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

const { success } = useToast();

// Priority order for sorting (HIGH = 0, MEDIUM = 1, LOW = 2)
const PRIORITY_ORDER: Record<ChorePriority, number> = {
  [ChorePriority.HIGH]: 0,
  [ChorePriority.MEDIUM]: 1,
  [ChorePriority.LOW]: 2,
};

// Sort chores by priority (HIGH first)
function sortByPriority(chores: Chore[]): Chore[] {
  return [...chores].sort((a, b) => {
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

// Computed sorted chores
const sortedTodoChores = computed(() => sortByPriority(props.todoChores));
const sortedInProgressChores = computed(() => sortByPriority(props.inProgressChores));
const sortedDoneChores = computed(() => sortByPriority(props.doneChores));

// Active tab panel index (0=TODO, 1=IN_PROGRESS, 2=DONE)
const activeColumnIndex = ref<number>(0);

// Accessibility announcement for screen readers
const accessibilityAnnouncement = ref<string>('');

// Handle swipe-based status change
function handleSwipeStatusChange(choreId: number, targetStatus: ChoreStatus): void {
  // Find the chore to get its title for accessibility
  const allChores = [...props.todoChores, ...props.inProgressChores, ...props.doneChores];
  const chore = allChores.find(c => c.id === choreId);
  const choreTitle = chore?.title || 'Task';

  // Emit status change to parent
  emit('status-change', choreId, targetStatus);

  // Announce for screen readers
  accessibilityAnnouncement.value = `${choreTitle} moved to ${getStatusLabel(targetStatus)}`;

  // Clear announcement after screen reader reads it
  setTimeout(() => {
    accessibilityAnnouncement.value = '';
  }, 1000);

  // Show success toast
  success(`Task moved to ${getStatusLabel(targetStatus)}`);

  // Navigate to target column after a brief delay
  setTimeout(() => {
    navigateToColumn(targetStatus);
  }, 150);
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
  // Map status to column index
  const statusToIndex: Record<ChoreStatus, number> = {
    [ChoreStatus.TODO]: 0,
    [ChoreStatus.IN_PROGRESS]: 1,
    [ChoreStatus.DONE]: 2,
  };

  activeColumnIndex.value = statusToIndex[status];
}
</script>

<style scoped lang="scss">
// Screen reader only class for accessibility
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>

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

// Tabs navigation
.kanban-tabs {
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #E5E7EB;

  :deep(.q-tab) {
    min-height: 44px;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
    position: relative;
  }

  :deep(.q-tab__indicator) {
    height: 2px;
  }

  :deep(.q-tab--active) {
    color: var(--q-primary);
  }
}

.kanban-tab-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 0.75rem;
  min-width: 20px;
  height: 20px;
  padding: 2px 6px;
}

// Tab panels
.kanban-panels {
  flex: 1;
  background: transparent;
  height: 100%;

  :deep(.q-panel) {
    padding: 0;
    overflow: hidden;
  }

  :deep(.q-tab-panel) {
    height: 100%;
  }
}

.kanban-panel {
  padding: 0 8px;
  padding-bottom: calc(var(--safe-bottom, 0px) + 80px);
  overflow: hidden;
  height: 100%;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  background: #F9FAFB;
  border-radius: 12px;
  overflow: hidden;
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
