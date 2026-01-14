import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { useMultiUserAuth } from '@/composables/useMultiUserAuth'
import { useConfiguration } from '@/composables/useConfiguration'
import type { User, LoginCredentials, SignupCredentials, StoredUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const multiUser = useMultiUserAuth()

  // State
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!currentUser.value && !!token.value)

  /**
   * Initialize auth from localStorage on app start
   */
  async function initializeAuth(): Promise<void> {
    const lastUser = multiUser.getLastUser()

    if (lastUser) {
      try {
        // Verify token is still valid
        const isValid = await authService.verifyToken(lastUser.jwt)

        if (isValid) {
          token.value = lastUser.jwt
          currentUser.value = {
            id: lastUser.id,
            username: lastUser.username,
            createdAt: '' // Will be fetched if needed
          }
        } else {
          // Token expired, remove from storage
          multiUser.removeUser(lastUser.id)
        }
      } catch (err) {
        console.error('Failed to verify last user token:', err)
        multiUser.removeUser(lastUser.id)
      }
    }
  }

  /**
   * Sign up new user
   */
  async function signup(credentials: Omit<SignupCredentials, 'projectKey'>): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const { getProjectKey } = useConfiguration()
      const projectKey = getProjectKey()

      if (!projectKey) {
        throw new Error('Project key not configured')
      }

      // Include projectKey in signup
      const signupData: SignupCredentials = {
        ...credentials,
        projectKey
      }

      // Create user
      const user = await authService.signup(signupData)

      // Login immediately after signup
      await login({ username: credentials.username, pin: credentials.pin })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign up'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login user
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)

      // Set current user and token
      token.value = response.token
      currentUser.value = {
        id: response.userId,
        username: response.username,
        createdAt: '' // Not provided in login response
      }

      // Save to multi-user storage
      const storedUser: StoredUser = {
        id: response.userId,
        username: response.username,
        jwt: response.token,
        lastLoginAt: new Date().toISOString()
      }
      multiUser.saveUser(storedUser)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Invalid username or PIN'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Quick login with stored user (PIN confirmation)
   */
  async function quickLogin(userId: string, pin: string): Promise<void> {
    const storedUser = multiUser.getUserById(userId)

    if (!storedUser) {
      throw new Error('User not found')
    }

    // Login with stored username and provided PIN
    await login({ username: storedUser.username, pin })
  }

  /**
   * Logout current user
   */
  function logout(): void {
    currentUser.value = null
    token.value = null
    error.value = null
  }

  /**
   * Clear error
   */
  function clearError(): void {
    error.value = null
  }

  return {
    // State
    currentUser,
    token,
    isLoading,
    error,
    isAuthenticated,

    // Actions
    initializeAuth,
    signup,
    login,
    quickLogin,
    logout,
    clearError
  }
})
