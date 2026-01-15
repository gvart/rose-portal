import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useConfiguration } from '@/composables/useConfiguration'
import * as choresApi from '../services/choresApi'
import type {
  Chore,
  ChoreStatus,
  ChorePriority,
  ChoreFormData,
  ChoreFilters,
  PaginationState,
  ModalMode,
  User
} from '../types/chores'
import { DEFAULT_CHORE_FORM, DEFAULT_FILTERS, DEFAULT_PAGINATION, ChoreStatus as Status } from '../types/chores'

export const useChoresStore = defineStore('chores', () => {
  // ============================================================================
  // State
  // ============================================================================

  // Chores data
  const chores = ref<Chore[]>([])
  const selectedChore = ref<Chore | null>(null)
  const users = ref<User[]>([])

  // UI state
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showChoreModal = ref(false)
  const modalMode = ref<ModalMode>('create')

  // Form state
  const choreFormData = ref<ChoreFormData>({ ...DEFAULT_CHORE_FORM })

  // Filters
  const filters = ref<ChoreFilters>({ ...DEFAULT_FILTERS })

  // Pagination state (per column)
  const todoPagination = ref<PaginationState>({ ...DEFAULT_PAGINATION })
  const inProgressPagination = ref<PaginationState>({ ...DEFAULT_PAGINATION })
  const donePagination = ref<PaginationState>({ ...DEFAULT_PAGINATION })

  // Onboarding state
  const hasSeenLongPressTooltip = ref<boolean>(
    localStorage.getItem('chores:seenLongPressTooltip') === 'true'
  )

  // ============================================================================
  // Computed - Chores by Status
  // ============================================================================

  const todoChores = computed(() =>
    chores.value.filter(chore => chore.status === Status.TODO)
  )

  const inProgressChores = computed(() =>
    chores.value.filter(chore => chore.status === Status.IN_PROGRESS)
  )

  const doneChores = computed(() =>
    chores.value.filter(chore => chore.status === Status.DONE)
  )

  // ============================================================================
  // Computed - Users
  // ============================================================================

  const usersFromChores = computed(() => {
    return users.value.sort((a, b) => a.username.localeCompare(b.username))
  })

  // ============================================================================
  // Computed - Current User
  // ============================================================================

  const currentUserId = computed(() => {
    const authStore = useAuthStore()
    const userId = authStore.currentUser?.id
    if (!userId) return null
    // Convert string ID to number for API compatibility
    return typeof userId === 'string' ? parseInt(userId, 10) : userId
  })

  // ============================================================================
  // Actions - Fetch
  // ============================================================================

  /**
   * Fetch chores with current filters
   * @param reset - Clear existing chores and reset pagination
   */
  async function fetchChores(reset: boolean = false): Promise<void> {
    if (reset) {
      chores.value = []
      todoPagination.value = { ...DEFAULT_PAGINATION }
      inProgressPagination.value = { ...DEFAULT_PAGINATION }
      donePagination.value = { ...DEFAULT_PAGINATION }
    }

    loading.value = true
    error.value = null

    try {
      const response = await choresApi.getChores(
        filters.value.statuses,
        filters.value.priorities.length > 0 ? filters.value.priorities : undefined,
        filters.value.assignedToId !== null ? filters.value.assignedToId : undefined,
        0,
        60 // Fetch more to populate all columns
      )

      // Replace chores
      chores.value = response.content

      // Update pagination states
      updatePaginationStates(response)

      // Fetch project users for assignment (non-blocking)
      fetchProjectUsers()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load chores'
      console.error('Failed to fetch chores:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Load more chores for a specific status column
   */
  async function loadMoreForStatus(status: ChoreStatus): Promise<void> {
    const pagination = getPaginationForStatus(status)

    if (!pagination.hasMore || pagination.loading) {
      return
    }

    pagination.loading = true

    try {
      const response = await choresApi.getChores(
        [status],
        filters.value.priorities.length > 0 ? filters.value.priorities : undefined,
        filters.value.assignedToId !== null ? filters.value.assignedToId : undefined,
        pagination.page + 1,
        pagination.size
      )

      // Merge new chores
      const existingIds = new Set(chores.value.map(c => c.id))
      const newChores = response.content.filter(c => !existingIds.has(c.id))
      chores.value.push(...newChores)

      // Update pagination
      pagination.page = response.page
      pagination.hasMore = !response.last
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load more chores'
      console.error('Failed to load more chores:', e)
    } finally {
      pagination.loading = false
    }
  }

  /**
   * Fetch all users in the project for assignment
   */
  async function fetchProjectUsers(): Promise<void> {
    try {
      const { getProjectKey } = useConfiguration()
      const projectKey = getProjectKey()

      if (!projectKey) {
        console.warn('No project key available, cannot fetch users')
        return
      }

      users.value = await choresApi.getProjectUsers(projectKey)
    } catch (e) {
      console.error('Failed to fetch project users:', e)
      // Don't set error state - this is non-critical
    }
  }

  // ============================================================================
  // Actions - CRUD
  // ============================================================================

  /**
   * Create new chore
   */
  async function createChore(formData: ChoreFormData): Promise<Chore | null> {
    loading.value = true
    error.value = null

    try {
      const newChore = await choresApi.createChore({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate.toISOString(),
        assignedToId: formData.assignedToId || undefined
      })

      // Add to local state
      chores.value.unshift(newChore)

      return newChore
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create chore'
      console.error('Failed to create chore:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update existing chore
   */
  async function updateChore(id: number, formData: ChoreFormData): Promise<Chore | null> {
    loading.value = true
    error.value = null

    try {
      const updatedChore = await choresApi.updateChore(id, {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate.toISOString(),
        assignedToId: formData.assignedToId || undefined
      })

      // Update in local state
      const index = chores.value.findIndex(c => c.id === id)
      if (index !== -1) {
        chores.value[index] = updatedChore
      }

      if (selectedChore.value?.id === id) {
        selectedChore.value = updatedChore
      }

      return updatedChore
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update chore'
      console.error('Failed to update chore:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update chore status (for drag & drop)
   * Uses optimistic update - reverts on failure
   */
  async function updateChoreStatus(id: number, newStatus: ChoreStatus): Promise<boolean> {
    // Optimistic update
    const chore = chores.value.find(c => c.id === id)
    if (!chore) return false

    const oldStatus = chore.status
    chore.status = newStatus

    try {
      const updatedChore = await choresApi.updateChoreStatus(id, newStatus)

      // Update with server response
      const index = chores.value.findIndex(c => c.id === id)
      if (index !== -1) {
        chores.value[index] = updatedChore
      }

      if (selectedChore.value?.id === id) {
        selectedChore.value = updatedChore
      }

      return true
    } catch (e) {
      // Revert on error
      chore.status = oldStatus
      error.value = e instanceof Error ? e.message : 'Failed to update status'
      console.error('Failed to update chore status:', e)
      return false
    }
  }

  /**
   * Update chore assignment
   */
  async function updateChoreAssignment(id: number, assignedToId: number | null): Promise<boolean> {
    try {
      const updatedChore = await choresApi.updateChoreAssignment(id, assignedToId)

      // Update in local state
      const index = chores.value.findIndex(c => c.id === id)
      if (index !== -1) {
        chores.value[index] = updatedChore
      }

      if (selectedChore.value?.id === id) {
        selectedChore.value = updatedChore
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update assignment'
      console.error('Failed to update chore assignment:', e)
      return false
    }
  }

  /**
   * Quick assign chore (for swipe actions) - convenience wrapper
   */
  async function quickAssignChore(id: number, assignedToId: number | null): Promise<boolean> {
    return await updateChoreAssignment(id, assignedToId)
  }

  /**
   * Delete chore
   */
  async function deleteChore(id: number): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await choresApi.deleteChore(id)

      // Remove from local state
      chores.value = chores.value.filter(c => c.id !== id)

      if (selectedChore.value?.id === id) {
        selectedChore.value = null
      }

      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete chore'
      console.error('Failed to delete chore:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Actions - Modal Management
  // ============================================================================

  function openCreateModal(): void {
    choreFormData.value = { ...DEFAULT_CHORE_FORM, dueDate: new Date() }
    selectedChore.value = null
    modalMode.value = 'create'
    showChoreModal.value = true
  }

  function openEditModal(chore: Chore): void {
    selectedChore.value = chore
    choreFormData.value = {
      title: chore.title,
      description: chore.description || '',
      priority: chore.priority,
      dueDate: new Date(chore.dueDate),
      assignedToId: chore.assignedTo?.id || null
    }
    modalMode.value = 'edit'
    showChoreModal.value = true
  }

  function closeModal(): void {
    showChoreModal.value = false
    selectedChore.value = null
  }

  // ============================================================================
  // Actions - Filters
  // ============================================================================

  function setFilters(newFilters: Partial<ChoreFilters>): void {
    filters.value = { ...filters.value, ...newFilters }
    fetchChores(true)
  }

  function togglePriorityFilter(priority: ChorePriority): void {
    const index = filters.value.priorities.indexOf(priority)
    if (index === -1) {
      filters.value.priorities.push(priority)
    } else {
      filters.value.priorities.splice(index, 1)
    }
    fetchChores(true)
  }

  function setAssigneeFilter(userId: number | null): void {
    filters.value.assignedToId = userId
    fetchChores(true)
  }

  function clearFilters(): void {
    filters.value = { ...DEFAULT_FILTERS }
    fetchChores(true)
  }

  function clearError(): void {
    error.value = null
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  function getPaginationForStatus(status: ChoreStatus): PaginationState {
    switch (status) {
      case Status.TODO:
        return todoPagination.value
      case Status.IN_PROGRESS:
        return inProgressPagination.value
      case Status.DONE:
        return donePagination.value
    }
  }

  function updatePaginationStates(response: any): void {
    // Simple implementation - could be enhanced for per-column tracking
    const hasMore = !response.last

    todoPagination.value.hasMore = hasMore
    inProgressPagination.value.hasMore = hasMore
    donePagination.value.hasMore = hasMore
  }

  // ============================================================================
  // Actions - Onboarding
  // ============================================================================

  function markLongPressTooltipSeen(): void {
    hasSeenLongPressTooltip.value = true
    localStorage.setItem('chores:seenLongPressTooltip', 'true')
  }

  function shouldShowOnboarding(): boolean {
    return !hasSeenLongPressTooltip.value && chores.value.length > 0
  }

  // ============================================================================
  // Return Public API
  // ============================================================================

  return {
    // State
    chores,
    selectedChore,
    users,
    loading,
    error,
    showChoreModal,
    modalMode,
    choreFormData,
    filters,
    todoPagination,
    inProgressPagination,
    donePagination,

    // Computed
    todoChores,
    inProgressChores,
    doneChores,
    usersFromChores,
    currentUserId,

    // Actions
    fetchChores,
    fetchProjectUsers,
    loadMoreForStatus,
    createChore,
    updateChore,
    updateChoreStatus,
    updateChoreAssignment,
    quickAssignChore,
    deleteChore,
    openCreateModal,
    openEditModal,
    closeModal,
    setFilters,
    togglePriorityFilter,
    setAssigneeFilter,
    clearFilters,
    clearError,
    hasSeenLongPressTooltip,
    markLongPressTooltipSeen,
    shouldShowOnboarding
  }
})
