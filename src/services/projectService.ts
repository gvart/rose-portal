import { createApiClient } from './apiClient'

const projectClient = createApiClient({ basePath: '/api/projects' })

export interface ValidateKeyRequest {
  key: string
}

export interface ValidateKeyResponse {
  exists: boolean
}

export interface InviteCodeResponse {
  code: string
  expiresAt: string // Instant from backend
}

export interface JoinProjectRequest {
  code: string
}

export interface JoinProjectResponse {
  projectKey: string
}

export const projectService = {
  /**
   * Validate if a project key exists
   * Used by web/PI5 on first launch
   */
  async validateKey(key: string): Promise<boolean> {
    const { data } = await projectClient.post<ValidateKeyResponse>(
      '/validate-key',
      { key } satisfies ValidateKeyRequest
    )
    return data.exists
  },

  /**
   * Generate a temporary invite code
   * Used by install page to show code for PWA devices
   */
  async getInviteCode(): Promise<InviteCodeResponse> {
    const { data } = await projectClient.post<InviteCodeResponse>(
      '/invite-code',
      {}
    )
    return data
  },

  /**
   * Join a project using invite code
   * Used by PWA on first launch
   */
  async joinProject(code: string): Promise<string> {
    console.log('[projectService] joinProject called with code:', code)
    console.log('[projectService] projectClient base URL:', projectClient.defaults.baseURL)

    try {
      const { data } = await projectClient.post<JoinProjectResponse>(
        '/join',
        { code } satisfies JoinProjectRequest
      )
      console.log('[projectService] joinProject response:', data)
      return data.projectKey
    } catch (error: any) {
      console.error('[projectService] joinProject error:', error)
      console.error('[projectService] Error type:', error.constructor.name)
      console.error('[projectService] Error response:', error.response)
      throw error
    }
  }
}
