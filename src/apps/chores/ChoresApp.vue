<template>
  <AppLayout title="Chores" theme-color="#EC4899">
    <div class="chores-app">
      <!-- Header with Filters and Create Button -->
      <ChoresHeader
        :loading="store.loading"
        :available-users="store.usersFromChores"
        :selected-priorities="store.filters.priorities"
        :selected-assignee="store.filters.assignedToId"
        :has-active-filters="hasActiveFilters"
        @create="store.openCreateModal()"
        @toggle-priority="store.togglePriorityFilter($event)"
        @select-assignee="store.setAssigneeFilter($event)"
        @clear-filters="store.clearFilters()"
      />

      <!-- Kanban Board -->
      <div class="chores-content">
        <KanbanBoard
          :todo-chores="store.todoChores"
          :in-progress-chores="store.inProgressChores"
          :done-chores="store.doneChores"
          :loading="store.loading"
          :todo-pagination="store.todoPagination"
          :in-progress-pagination="store.inProgressPagination"
          :done-pagination="store.donePagination"
          @status-change="handleStatusChange"
          @select-chore="handleSelectChore"
          @load-more="store.loadMoreForStatus($event)"
        />
      </div>

      <!-- Chore Modal -->
      <ChoreModal
        v-model="store.showChoreModal"
        :mode="store.modalMode"
        :form-data="store.choreFormData"
        :selected-chore="store.selectedChore"
        :available-users="store.usersFromChores"
        :loading="store.loading"
        :can-delete="canDeleteChore"
        @save="handleSave"
        @delete="handleDelete"
      />

      <!-- Error Banner -->
      <Transition name="error-fade">
        <div v-if="store.error" class="error-banner">
          <div class="error-content">
            <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ store.error }}</span>
          </div>
          <button class="error-close" @click="store.clearError()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Transition>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ChoresHeader from './components/ChoresHeader.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import ChoreModal from './components/ChoreModal.vue'
import { useChoresStore } from './stores/choresStore'
import type { ChoreStatus, ChoreFormData, Chore } from './types/chores'
import { canEditChore } from './types/chores'

const store = useChoresStore()

const hasActiveFilters = computed(() => {
  return (
    store.filters.priorities.length > 0 ||
    store.filters.assignedToId !== null
  )
})

const canDeleteChore = computed(() => {
  if (!store.selectedChore || store.currentUserId === null) return false
  return canEditChore(store.selectedChore, store.currentUserId)
})

onMounted(async () => {
  await store.fetchChores()
})

async function handleStatusChange(choreId: number, newStatus: ChoreStatus): Promise<void> {
  await store.updateChoreStatus(choreId, newStatus)
}

function handleSelectChore(chore: Chore): void {
  // Check if user can edit before opening modal
  if (store.currentUserId !== null && canEditChore(chore, store.currentUserId)) {
    store.openEditModal(chore)
  }
}

async function handleSave(formData: ChoreFormData): Promise<void> {
  let success = false

  if (store.modalMode === 'create') {
    const result = await store.createChore(formData)
    success = result !== null
  } else if (store.selectedChore) {
    const result = await store.updateChore(store.selectedChore.id, formData)
    success = result !== null
  }

  if (success) {
    store.closeModal()
  }
}

async function handleDelete(): Promise<void> {
  if (!store.selectedChore) return

  const success = await store.deleteChore(store.selectedChore.id)
  if (success) {
    store.closeModal()
  }
}
</script>

<style scoped>
.chores-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1rem;
}

.chores-content {
  flex: 1;
  overflow: hidden;
  margin-top: 1rem;
}

/* Error Banner */
.error-banner {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 42rem;
  width: calc(100% - 2rem);
  z-index: 50;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #dc2626;
  flex-shrink: 0;
}

.error-content span {
  color: #991b1b;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-close {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #dc2626;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.error-close:hover {
  background: #fecaca;
}

.error-close svg {
  width: 1rem;
  height: 1rem;
}

/* Error Transition */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}

@media (max-width: 768px) {
  .chores-app {
    padding: 0 0.5rem;
  }

  .error-banner {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    width: auto;
    transform: none;
  }

  .error-fade-enter-from,
  .error-fade-leave-to {
    transform: translateY(1rem);
  }
}
</style>
