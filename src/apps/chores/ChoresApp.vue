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
          @long-press="handleLongPress"
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

      <!-- Context Menu for Long Press -->
      <ChoreContextMenu
        v-model="showContextMenu"
        :chore="selectedChoreForMenu"
        :can-edit="canEditSelectedChoreForMenu"
        @move-to-todo="handleMoveToStatus(ChoreStatus.TODO)"
        @move-to-in-progress="handleMoveToStatus(ChoreStatus.IN_PROGRESS)"
        @move-to-done="handleMoveToStatus(ChoreStatus.DONE)"
        @edit="handleEditFromMenu"
        @delete="handleDeleteFromMenu"
      />

      <!-- Confirm Delete Dialog -->
      <ConfirmDialog
        v-model="showDeleteDialog"
        :title="`Delete ${choreToDelete?.title}?`"
        message="This action cannot be undone."
        confirm-text="Delete"
        cancel-text="Cancel"
        @confirm="handleConfirmDelete"
      />

      <!-- Onboarding Tooltip -->
      <OnboardingTooltip
        v-model="showOnboarding"
        :target-element="firstChoreElement"
        @dismiss="handleDismissOnboarding"
      />

      <!-- FAB (mobile only) -->
      <button
        v-if="isMobile"
        v-haptic
        class="chores-fab"
        aria-label="Create new chore"
        @click="store.openCreateModal()"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>

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
import { computed, onMounted, ref, nextTick, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ChoresHeader from './components/ChoresHeader.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import ChoreModal from './components/ChoreModal.vue'
import ChoreContextMenu from './components/ChoreContextMenu.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import OnboardingTooltip from './components/OnboardingTooltip.vue'
import { useChoresStore } from './stores/choresStore'
import type { ChoreFormData, Chore } from './types/chores'
import { ChoreStatus, canEditChore } from './types/chores'
import { usePWA } from '@/composables/usePWA'

const store = useChoresStore()
const { isInstalled } = usePWA()
const showDeleteDialog = ref(false)
const choreToDelete = ref<Chore | null>(null)
const showContextMenu = ref(false)
const selectedChoreForMenu = ref<Chore | null>(null)
const showOnboarding = ref(false)
const firstChoreElement = ref<HTMLElement | null>(null)

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

const canEditSelectedChoreForMenu = computed(() => {
  if (!selectedChoreForMenu.value || store.currentUserId === null) return false
  return canEditChore(selectedChoreForMenu.value, store.currentUserId)
})

const isMobile = computed(() => window.innerWidth < 768)

const shouldShowOnboardingTooltip = computed(() => {
  // Only show onboarding in PWA mode
  return isInstalled.value && store.shouldShowOnboarding()
})

// Show onboarding after chores load
watch(() => store.loading, async (loading) => {
  if (!loading && shouldShowOnboardingTooltip.value) {
    await nextTick()

    // Find first chore card element
    const firstCard = document.querySelector('.chore-card-wrapper') as HTMLElement
    if (firstCard) {
      firstChoreElement.value = firstCard
      showOnboarding.value = true

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (showOnboarding.value) {
          handleDismissOnboarding()
        }
      }, 10000)
    }
  }
})

// Dismiss when user performs first long press
watch(() => showContextMenu.value, (isShowing) => {
  if (isShowing && showOnboarding.value) {
    handleDismissOnboarding()
  }
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

function handleDelete(): void {
  if (!store.selectedChore) return

  choreToDelete.value = store.selectedChore
  showDeleteDialog.value = true
}

// Long press action handler
function handleLongPress(chore: Chore): void {
  selectedChoreForMenu.value = chore
  showContextMenu.value = true
}

async function handleMoveToStatus(newStatus: ChoreStatus): Promise<void> {
  if (selectedChoreForMenu.value) {
    await store.updateChoreStatus(selectedChoreForMenu.value.id, newStatus)
  }
}

function handleEditFromMenu(): void {
  if (selectedChoreForMenu.value) {
    handleSelectChore(selectedChoreForMenu.value)
  }
}

function handleDeleteFromMenu(): void {
  if (selectedChoreForMenu.value) {
    choreToDelete.value = selectedChoreForMenu.value
    showDeleteDialog.value = true
  }
}

async function handleConfirmDelete(): Promise<void> {
  if (choreToDelete.value) {
    const success = await store.deleteChore(choreToDelete.value.id)
    if (success && store.showChoreModal) {
      // Close the modal if we deleted from the card details view
      store.closeModal()
    }
    choreToDelete.value = null
  }
}

function handleDismissOnboarding(): void {
  showOnboarding.value = false
  store.markLongPressTooltipSeen()
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

/* FAB (Floating Action Button) */
.chores-fab {
  position: fixed;
  bottom: calc(var(--safe-bottom, 0px) + var(--space-4, 16px));
  right: var(--space-4, 16px);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #EC4899;
  border: var(--depth-2-border, 1px solid #cbd5e1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  cursor: pointer;
  transition: transform var(--duration-fast, 150ms) cubic-bezier(0.25, 1, 0.5, 1);
}

.chores-fab svg {
  width: 24px;
  height: 24px;
}

.chores-fab:active {
  transform: scale(0.95);
}

@media (min-width: 769px) {
  .chores-fab {
    display: none; /* Desktop uses header button */
  }
}
</style>
