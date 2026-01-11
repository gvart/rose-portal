import { apiClients } from '@/services/apiClient'
import type {
  ApiNote,
  CreateNoteRequest,
  UpdateNoteRequest,
  PaginatedNotesResponse,
  Note,
  Tag
} from '../types/notes'

const api = apiClients.notes

/**
 * Fetch paginated notes with optional tag filtering
 * @param tagIds - Optional array of tag IDs to filter by (OR logic)
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 20)
 * @param sort - Sort field (default: createdAt)
 * @returns Paginated response with notes
 */
export async function getNotes(
  tagIds?: number[],
  page: number = 0,
  size: number = 20,
  sort: string = 'createdAt'
): Promise<PaginatedNotesResponse> {
  const params: Record<string, string | number> = { page, size, sort }

  if (tagIds && tagIds.length > 0) {
    params.tagIds = tagIds.join(',')
  }

  const response = await api.get<PaginatedNotesResponse>('/notes', { params })

  // Transform API notes to internal format
  return {
    ...response.data,
    content: response.data.content.map(transformApiNoteToInternal)
  }
}

/**
 * Create a new note
 * @param request - Note data (name, content, tagIds)
 * @returns Created note
 */
export async function createNote(request: CreateNoteRequest): Promise<Note> {
  const response = await api.post<ApiNote>('/notes', request)
  return transformApiNoteToInternal(response.data)
}

/**
 * Update an existing note
 * @param id - Note ID
 * @param request - Updated note data (name, content, tagIds)
 * @returns Updated note
 */
export async function updateNote(id: number, request: UpdateNoteRequest): Promise<Note> {
  const response = await api.put<ApiNote>(`/notes/${id}`, request)
  return transformApiNoteToInternal(response.data)
}

/**
 * Delete a note
 * @param id - Note ID
 */
export async function deleteNote(id: number): Promise<void> {
  await api.delete(`/notes/${id}`)
}

/**
 * Transform API note to internal format
 */
function transformApiNoteToInternal(apiNote: ApiNote): Note {
  return {
    id: apiNote.id,
    name: apiNote.name,
    content: apiNote.content,
    createdAt: new Date(apiNote.createdAt),
    updatedAt: new Date(apiNote.updatedAt),
    createdBy: apiNote.createdBy,
    tags: apiNote.tags.map(transformApiTagToInternal)
  }
}

/**
 * Transform API tag to internal format
 */
function transformApiTagToInternal(apiTag: { id: number; name: string; color: string; createdAt: string; updatedAt: string }): Tag {
  return {
    id: apiTag.id,
    name: apiTag.name,
    color: apiTag.color,
    createdAt: new Date(apiTag.createdAt),
    updatedAt: new Date(apiTag.updatedAt)
  }
}
