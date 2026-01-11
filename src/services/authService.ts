import { createApiClient } from './apiClient'
import type { AuthResponse, User, LoginCredentials, SignupCredentials } from '@/types/auth'

const authClient = createApiClient({ basePath: '/api' })

export const authService = {
  /**
   * Create a new user account
   */
  async signup(credentials: SignupCredentials): Promise<User> {
    const { data } = await authClient.post<User>('/users', credentials)
    return data
  },

  /**
   * Login with username and PIN
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await authClient.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(token: string): Promise<User> {
    const { data } = await authClient.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data
  },

  /**
   * Verify token validity
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.getCurrentUser(token)
      return true
    } catch {
      return false
    }
  }
}
