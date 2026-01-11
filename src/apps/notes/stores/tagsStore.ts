import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as tagsApi from '../services/tagsApi'
import type { Tag, CreateTagRequest, UpdateTagRequest } from '../types/notes'

export const useTagsStore = defineStore('tags', () => {
  // ============================================================================
  // State
  // ============================================================================
  const tags = ref<Tag[]>([])
  const selectedTagIds = ref<number[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const showTagManager = ref(false)

  // ============================================================================
  // Computed
  // ============================================================================
  const selectedTags = computed(() =>
    tags.value.filter((tag) => selectedTagIds.value.includes(tag.id))
  )

  const hasActiveFilters = computed(() => selectedTagIds.value.length > 0)

  // ============================================================================
  // Actions - CRUD
  // ============================================================================

  /**
   * Fetch all tags for the authenticated user
   */
  async function fetchTags(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      tags.value = await tagsApi.getTags()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load tags'
      console.error('Failed to fetch tags:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new tag
   */
  async function createTag(request: CreateTagRequest): Promise<Tag | null> {
    loading.value = true
    error.value = null
    try {
      const newTag = await tagsApi.createTag(request)
      tags.value.push(newTag)
      return newTag
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create tag'
      console.error('Failed to create tag:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing tag
   */
  async function updateTag(id: number, request: UpdateTagRequest): Promise<Tag | null> {
    loading.value = true
    error.value = null
    try {
      const updatedTag = await tagsApi.updateTag(id, request)
      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tags.value[index] = updatedTag
      }
      return updatedTag
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update tag'
      console.error('Failed to update tag:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a tag
   */
  async function deleteTag(id: number): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await tagsApi.deleteTag(id)
      tags.value = tags.value.filter((t) => t.id !== id)
      // Remove from selected filters if it was selected
      selectedTagIds.value = selectedTagIds.value.filter((tid) => tid !== id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete tag'
      console.error('Failed to delete tag:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Actions - Filtering
  // ============================================================================

  /**
   * Toggle a tag filter on/off
   */
  function toggleTagFilter(tagId: number): void {
    const index = selectedTagIds.value.indexOf(tagId)
    if (index === -1) {
      selectedTagIds.value.push(tagId)
    } else {
      selectedTagIds.value.splice(index, 1)
    }
  }

  /**
   * Clear all tag filters
   */
  function clearFilters(): void {
    selectedTagIds.value = []
  }

  /**
   * Set tag filters to specific tag IDs
   */
  function setFilters(tagIds: number[]): void {
    selectedTagIds.value = [...tagIds]
  }

  // ============================================================================
  // Actions - UI State
  // ============================================================================

  function openTagManager(): void {
    showTagManager.value = true
  }

  function closeTagManager(): void {
    showTagManager.value = false
  }

  function clearError(): void {
    error.value = null
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    tags,
    selectedTagIds,
    loading,
    error,
    showTagManager,

    // Computed
    selectedTags,
    hasActiveFilters,

    // Actions
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    toggleTagFilter,
    clearFilters,
    setFilters,
    openTagManager,
    closeTagManager,
    clearError
  }
})
