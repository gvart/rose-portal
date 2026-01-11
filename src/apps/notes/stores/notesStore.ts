import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import * as notesApi from '../services/notesApi'
import type { Note, CreateNoteRequest, UpdateNoteRequest, PaginationState } from '../types/notes'
import { useTagsStore } from './tagsStore'

export const useNotesStore = defineStore('notes', () => {
  const tagsStore = useTagsStore()

  // ============================================================================
  // State
  // ============================================================================
  const notes = ref<Note[]>([])
  const selectedNoteId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Pagination state
  const pagination = ref<PaginationState>({
    currentPage: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    hasMore: true,
    loading: false
  })

  // Editor state
  const editorContent = ref<string>('')
  const editorTitle = ref<string>('')
  const editorDirty = ref(false)
  const originalContent = ref<string>('') // Track original content for comparison
  const originalTitle = ref<string>('') // Track original title for comparison
  const isSaving = ref(false) // Track auto-save state
  const lastSaved = ref<Date | null>(null) // Track last save time

  // ============================================================================
  // Computed
  // ============================================================================
  const selectedNote = computed(() => notes.value.find((n) => n.id === selectedNoteId.value) || null)

  const hasNotes = computed(() => notes.value.length > 0)

  // ============================================================================
  // Actions - Fetch & Pagination
  // ============================================================================

  /**
   * Fetch notes with pagination and optional tag filtering
   * @param reset - If true, reset pagination and clear existing notes
   */
  async function fetchNotes(reset: boolean = false): Promise<void> {
    if (reset) {
      notes.value = []
      pagination.value.currentPage = 0
      pagination.value.hasMore = true
    }

    if (!pagination.value.hasMore || pagination.value.loading) {
      return
    }

    pagination.value.loading = true
    loading.value = true
    error.value = null

    try {
      const response = await notesApi.getNotes(
        tagsStore.selectedTagIds.length > 0 ? tagsStore.selectedTagIds : undefined,
        pagination.value.currentPage,
        pagination.value.pageSize
      )

      // Merge notes (avoid duplicates)
      const existingIds = new Set(notes.value.map((n) => n.id))
      const newNotes = response.content.filter((n) => !existingIds.has(n.id))
      notes.value.push(...newNotes)

      // Update pagination state
      pagination.value = {
        currentPage: response.page,
        pageSize: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        hasMore: !response.last,
        loading: false
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load notes'
      console.error('Failed to fetch notes:', e)
      pagination.value.loading = false
    } finally {
      loading.value = false
    }
  }

  /**
   * Load the next page of notes
   */
  async function loadMore(): Promise<void> {
    if (pagination.value.hasMore && !pagination.value.loading) {
      pagination.value.currentPage++
      await fetchNotes()
    }
  }

  // ============================================================================
  // Actions - CRUD
  // ============================================================================

  /**
   * Create a new note
   */
  async function createNote(request: CreateNoteRequest): Promise<Note | null> {
    loading.value = true
    error.value = null
    try {
      const newNote = await notesApi.createNote(request)
      notes.value.unshift(newNote) // Add to beginning
      pagination.value.totalElements++
      return newNote
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to create note'
      console.error('Failed to create note:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing note
   */
  async function updateNote(id: number, request: UpdateNoteRequest): Promise<Note | null> {
    isSaving.value = true
    error.value = null
    try {
      const updatedNote = await notesApi.updateNote(id, request)
      const index = notes.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notes.value[index] = updatedNote
      }
      // Update original content and title after successful save
      originalContent.value = updatedNote.content
      originalTitle.value = updatedNote.name
      editorTitle.value = updatedNote.name
      editorDirty.value = false
      lastSaved.value = new Date()
      return updatedNote
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update note'
      console.error('Failed to update note:', e)
      return null
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Delete a note
   */
  async function deleteNote(id: number): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await notesApi.deleteNote(id)
      notes.value = notes.value.filter((n) => n.id !== id)
      pagination.value.totalElements--
      if (selectedNoteId.value === id) {
        selectNote(null)
      }
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete note'
      console.error('Failed to delete note:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // Actions - Selection & Editor
  // ============================================================================

  /**
   * Select a note for editing
   */
  function selectNote(noteId: number | null): void {
    selectedNoteId.value = noteId
    if (noteId !== null) {
      const note = notes.value.find((n) => n.id === noteId)
      if (note) {
        editorContent.value = note.content
        editorTitle.value = note.name
        originalContent.value = note.content // Store original for comparison
        originalTitle.value = note.name // Store original title for comparison
        editorDirty.value = false
      }
    } else {
      editorContent.value = ''
      editorTitle.value = ''
      originalContent.value = ''
      originalTitle.value = ''
      editorDirty.value = false
    }
  }

  /**
   * Update editor content (marks as dirty if content or title changed)
   */
  function updateEditorContent(markdown: string): void {
    editorContent.value = markdown
    // Mark as dirty if content OR title is different from original
    editorDirty.value = markdown !== originalContent.value || editorTitle.value !== originalTitle.value
  }

  /**
   * Update editor title (marks as dirty if content or title changed)
   */
  function updateEditorTitle(title: string): void {
    editorTitle.value = title
    // Mark as dirty if content OR title is different from original
    editorDirty.value = editorContent.value !== originalContent.value || title !== originalTitle.value
  }

  /**
   * Clear error message
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * Reset store to initial state (for navigation/cleanup)
   */
  function resetStore(): void {
    selectedNoteId.value = null
    editorContent.value = ''
    editorTitle.value = ''
    originalContent.value = ''
    originalTitle.value = ''
    editorDirty.value = false
    isSaving.value = false
    lastSaved.value = null
  }

  /**
   * Add a tag to the currently selected note
   */
  function addTagToNote(tagId: number): void {
    if (!selectedNote.value) return

    // Check if tag is already on the note
    if (selectedNote.value.tags.some((t) => t.id === tagId)) return

    // Find the tag from tagsStore
    const tag = tagsStore.tags.find((t) => t.id === tagId)
    if (!tag) return

    // Add to note's tags array
    selectedNote.value.tags.push(tag)

    // Mark as dirty to trigger auto-save
    editorDirty.value = true
  }

  /**
   * Remove a tag from the currently selected note
   */
  function removeTagFromNote(tagId: number): void {
    if (!selectedNote.value) return

    // Remove from note's tags array
    selectedNote.value.tags = selectedNote.value.tags.filter((t) => t.id !== tagId)

    // Mark as dirty to trigger auto-save
    editorDirty.value = true
  }

  /**
   * Toggle a tag on the currently selected note
   */
  function toggleNoteTag(tagId: number): void {
    if (!selectedNote.value) return

    const hasTag = selectedNote.value.tags.some((t) => t.id === tagId)
    if (hasTag) {
      removeTagFromNote(tagId)
    } else {
      addTagToNote(tagId)
    }
  }

  // ============================================================================
  // Watchers
  // ============================================================================

  // Watch for filter changes - reset and refetch
  watch(
    () => tagsStore.selectedTagIds,
    () => {
      fetchNotes(true)
    },
    { deep: true }
  )

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    notes,
    selectedNoteId,
    loading,
    error,
    pagination,
    editorContent,
    editorTitle,
    editorDirty,
    isSaving,
    lastSaved,

    // Computed
    selectedNote,
    hasNotes,

    // Actions
    fetchNotes,
    loadMore,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    updateEditorContent,
    updateEditorTitle,
    clearError,
    resetStore,
    addTagToNote,
    removeTagFromNote,
    toggleNoteTag
  }
})
