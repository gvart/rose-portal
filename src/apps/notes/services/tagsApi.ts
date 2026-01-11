import { apiClients } from '@/services/apiClient'
import type { ApiTag, CreateTagRequest, UpdateTagRequest, Tag } from '../types/notes'

const api = apiClients.notes

/**
 * Fetch all tags for the authenticated user
 * @returns Array of tags
 */
export async function getTags(): Promise<Tag[]> {
  const response = await api.get<ApiTag[]>('/tags')
  return response.data.map(transformApiTagToInternal)
}

/**
 * Create a new tag
 * @param request - Tag data (name, color)
 * @returns Created tag
 */
export async function createTag(request: CreateTagRequest): Promise<Tag> {
  const response = await api.post<ApiTag>('/tags', request)
  return transformApiTagToInternal(response.data)
}

/**
 * Update an existing tag
 * @param id - Tag ID
 * @param request - Updated tag data (name, color)
 * @returns Updated tag
 */
export async function updateTag(id: number, request: UpdateTagRequest): Promise<Tag> {
  const response = await api.put<ApiTag>(`/tags/${id}`, request)
  return transformApiTagToInternal(response.data)
}

/**
 * Delete a tag
 * @param id - Tag ID
 */
export async function deleteTag(id: number): Promise<void> {
  await api.delete(`/tags/${id}`)
}

/**
 * Transform API tag to internal format
 */
function transformApiTagToInternal(apiTag: ApiTag): Tag {
  return {
    id: apiTag.id,
    name: apiTag.name,
    color: apiTag.color,
    createdAt: new Date(apiTag.createdAt),
    updatedAt: new Date(apiTag.updatedAt)
  }
}
