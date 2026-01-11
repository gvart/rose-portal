// ============================================================================
// API Types (Backend DTOs)
// ============================================================================

export interface ApiUser {
  id: number
  username: string
}

export interface ApiChore {
  id: number
  title: string
  description: string | null
  status: ChoreStatus
  priority: ChorePriority
  dueDate: string // ISO 8601
  assignedTo: ApiUser | null
  createdBy: ApiUser
  completedBy: ApiUser | null
  completedAt: string | null // ISO 8601
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export interface CreateChoreRequest {
  title: string
  description?: string
  priority: ChorePriority
  dueDate: string // ISO 8601
  assignedToId?: number
}

export interface UpdateChoreRequest {
  title: string
  description?: string
  priority: ChorePriority
  dueDate: string // ISO 8601
  assignedToId?: number
}

export interface UpdateStatusRequest {
  status: ChoreStatus
}

export interface UpdateAssignmentRequest {
  assignedToId: number | null
}

export interface ApiPaginatedChoresResponse {
  content: ApiChore[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface PaginatedChoresResponse {
  content: Chore[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// ============================================================================
// Enums
// ============================================================================

export enum ChoreStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum ChorePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// ============================================================================
// Internal Application Types
// ============================================================================

export interface User {
  id: number
  username: string
}

export interface Chore {
  id: number
  title: string
  description: string | null
  status: ChoreStatus
  priority: ChorePriority
  dueDate: Date
  assignedTo: User | null
  createdBy: User
  completedBy: User | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ChoreFormData {
  title: string
  description: string
  priority: ChorePriority
  dueDate: Date
  assignedToId: number | null
}

export const DEFAULT_CHORE_FORM: ChoreFormData = {
  title: '',
  description: '',
  priority: ChorePriority.MEDIUM,
  dueDate: new Date(),
  assignedToId: null
}

// ============================================================================
// Filter Types
// ============================================================================

export interface ChoreFilters {
  statuses: ChoreStatus[]
  priorities: ChorePriority[]
  assignedToId: number | null
}

export const DEFAULT_FILTERS: ChoreFilters = {
  statuses: [ChoreStatus.TODO, ChoreStatus.IN_PROGRESS, ChoreStatus.DONE],
  priorities: [],
  assignedToId: null
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationState {
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasMore: boolean
  loading: boolean
}

export const DEFAULT_PAGINATION: PaginationState = {
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasMore: true,
  loading: false
}

// ============================================================================
// UI Types
// ============================================================================

export type ModalMode = 'create' | 'edit'

export interface PriorityConfig {
  value: ChorePriority
  label: string
  color: string
  bgColor: string
  textColor: string
}

export const PRIORITY_CONFIGS: Record<ChorePriority, PriorityConfig> = {
  [ChorePriority.LOW]: {
    value: ChorePriority.LOW,
    label: 'Low',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46'
  },
  [ChorePriority.MEDIUM]: {
    value: ChorePriority.MEDIUM,
    label: 'Medium',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E'
  },
  [ChorePriority.HIGH]: {
    value: ChorePriority.HIGH,
    label: 'High',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B'
  }
}

export interface StatusConfig {
  value: ChoreStatus
  label: string
  color: string
}

export const STATUS_CONFIGS: Record<ChoreStatus, StatusConfig> = {
  [ChoreStatus.TODO]: {
    value: ChoreStatus.TODO,
    label: 'To Do',
    color: '#6B7280'
  },
  [ChoreStatus.IN_PROGRESS]: {
    value: ChoreStatus.IN_PROGRESS,
    label: 'In Progress',
    color: '#3B82F6'
  },
  [ChoreStatus.DONE]: {
    value: ChoreStatus.DONE,
    label: 'Done',
    color: '#10B981'
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a chore is overdue
 * @param chore - The chore to check
 * @returns true if the chore is overdue and not completed
 */
export function isOverdue(chore: Chore): boolean {
  if (chore.status === ChoreStatus.DONE) {
    return false
  }
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dueDate = new Date(chore.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < now
}

/**
 * Check if a chore is due soon (within 2 days)
 * @param chore - The chore to check
 * @returns true if the chore is due within 2 days and not completed
 */
export function isDueSoon(chore: Chore): boolean {
  if (chore.status === ChoreStatus.DONE) {
    return false
  }
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dueDate = new Date(chore.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  const twoDaysFromNow = new Date(now)
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

  return dueDate >= now && dueDate <= twoDaysFromNow
}

/**
 * Check if the current user can edit a chore
 * @param chore - The chore to check
 * @param currentUserId - The ID of the current user
 * @returns true if the current user created the chore
 */
export function canEditChore(chore: Chore, currentUserId: number): boolean {
  return chore.createdBy.id === currentUserId
}

/**
 * Format a date for display
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 15")
 */
export function formatDueDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
