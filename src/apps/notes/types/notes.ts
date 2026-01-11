// ============================================================================
// API Types (Backend DTOs)
// ============================================================================

export interface ApiTag {
  id: number
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateTagRequest {
  name: string
  color: string
}

export interface UpdateTagRequest {
  name: string
  color: string
}

export interface ApiNote {
  id: number
  name: string
  content: string // Markdown string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
  }
  tags: ApiTag[]
}

export interface CreateNoteRequest {
  name: string
  content: string
  tagIds: number[]
}

export interface UpdateNoteRequest {
  name: string
  content: string
  tagIds: number[]
}

export interface PaginatedNotesResponse {
  content: ApiNote[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// ============================================================================
// Internal Application Types
// ============================================================================

export interface Tag {
  id: number
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: number
  name: string
  content: string // Markdown
  createdAt: Date
  updatedAt: Date
  createdBy: User
  tags: Tag[]
}

export interface User {
  id: string
  name: string
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasMore: boolean
  loading: boolean
}

// ============================================================================
// UI Types & Constants
// ============================================================================

export type TagColor =
  | '#EF4444' // red
  | '#F59E0B' // amber
  | '#10B981' // green
  | '#3B82F6' // blue
  | '#8B5CF6' // purple
  | '#EC4899' // pink
  | '#6B7280' // gray

export const TAG_COLORS: TagColor[] = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280'
]

export interface TagFormData {
  name: string
  color: TagColor
}
