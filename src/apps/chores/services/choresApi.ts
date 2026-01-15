import { apiClients } from '@/services/apiClient'
import type {
  ApiChore,
  Chore,
  ChoreStatus,
  ChorePriority,
  CreateChoreRequest,
  UpdateChoreRequest,
  UpdateStatusRequest,
  UpdateAssignmentRequest,
  ApiPaginatedChoresResponse,
  PaginatedChoresResponse,
  User,
  ApiUser
} from '../types/chores'

const api = apiClients.chores

/**
 * Fetch chores with filtering and pagination
 * @param statuses - Filter by status (optional)
 * @param priorities - Filter by priority (optional)
 * @param assignedToId - Filter by assigned user ID (optional)
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 20)
 * @returns Paginated chores response with transformed internal chores
 */
export async function getChores(
  statuses?: ChoreStatus[],
  priorities?: ChorePriority[],
  assignedToId?: number,
  page: number = 0,
  size: number = 20
): Promise<PaginatedChoresResponse> {
  const params: Record<string, string | number> = { page, size }

  if (statuses && statuses.length > 0) {
    params.statuses = statuses.join(',')
  }
  if (priorities && priorities.length > 0) {
    params.priorities = priorities.join(',')
  }
  if (assignedToId !== undefined && assignedToId !== null) {
    params.assignedToId = assignedToId
  }

  const response = await api.get<ApiPaginatedChoresResponse>('', { params })

  // Transform API chores to internal format
  const transformedChores = response.data.content.map(transformApiChoreToInternal)

  return {
    content: transformedChores,
    page: response.data.page,
    size: response.data.size,
    totalElements: response.data.totalElements,
    totalPages: response.data.totalPages,
    first: response.data.first,
    last: response.data.last
  }
}

/**
 * Get single chore by ID
 * @param id - Chore ID
 * @returns Chore with transformed dates
 */
export async function getChore(id: number): Promise<Chore> {
  const response = await api.get<ApiChore>(`/${id}`)
  return transformApiChoreToInternal(response.data)
}

/**
 * Create a new chore
 * @param request - Create chore request data
 * @returns Newly created chore with transformed dates
 */
export async function createChore(request: CreateChoreRequest): Promise<Chore> {
  const response = await api.post<ApiChore>('', request)
  return transformApiChoreToInternal(response.data)
}

/**
 * Update existing chore
 * @param id - Chore ID
 * @param request - Update chore request data
 * @returns Updated chore with transformed dates
 */
export async function updateChore(id: number, request: UpdateChoreRequest): Promise<Chore> {
  const response = await api.put<ApiChore>(`/${id}`, request)
  return transformApiChoreToInternal(response.data)
}

/**
 * Update chore status only
 * @param id - Chore ID
 * @param status - New status
 * @returns Updated chore with transformed dates
 */
export async function updateChoreStatus(id: number, status: ChoreStatus): Promise<Chore> {
  const request: UpdateStatusRequest = { status }
  const response = await api.patch<ApiChore>(`/${id}/status`, request)
  return transformApiChoreToInternal(response.data)
}

/**
 * Update chore assignment only
 * @param id - Chore ID
 * @param assignedToId - User ID to assign to (or null to unassign)
 * @returns Updated chore with transformed dates
 */
export async function updateChoreAssignment(id: number, assignedToId: number | null): Promise<Chore> {
  const request: UpdateAssignmentRequest = { assignedToId }
  const response = await api.patch<ApiChore>(`/${id}/assign`, request)
  return transformApiChoreToInternal(response.data)
}

/**
 * Delete a chore
 * @param id - Chore ID
 */
export async function deleteChore(id: number): Promise<void> {
  await api.delete(`/${id}`)
}

/**
 * Fetch all users in a project
 * @param projectId - Project key/ID
 * @returns List of users in the project
 */
export async function getProjectUsers(projectId: string): Promise<User[]> {
  const response = await apiClients.notes.get<ApiUser[]>(`/users/project/${projectId}`)
  return response.data.map(transformApiUserToInternal)
}

// ============================================================================
// Transformation Functions
// ============================================================================

/**
 * Transform API chore to internal format
 * Converts ISO 8601 date strings to Date objects
 * @param apiChore - API chore response
 * @returns Internal chore format
 */
function transformApiChoreToInternal(apiChore: ApiChore): Chore {
  return {
    id: apiChore.id,
    title: apiChore.title,
    description: apiChore.description,
    status: apiChore.status,
    priority: apiChore.priority,
    dueDate: new Date(apiChore.dueDate),
    assignedTo: apiChore.assignedTo ? transformApiUserToInternal(apiChore.assignedTo) : null,
    createdBy: transformApiUserToInternal(apiChore.createdBy),
    completedBy: apiChore.completedBy ? transformApiUserToInternal(apiChore.completedBy) : null,
    completedAt: apiChore.completedAt ? new Date(apiChore.completedAt) : null,
    createdAt: new Date(apiChore.createdAt),
    updatedAt: new Date(apiChore.updatedAt)
  }
}

/**
 * Transform API user to internal format
 * @param apiUser - API user response
 * @returns Internal user format
 */
function transformApiUserToInternal(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    username: apiUser.username
  }
}
