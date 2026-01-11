import { ref, computed } from 'vue'
import type { StoredUser } from '@/types/auth'

const STORAGE_KEY = 'rose_portal_users'
const STORAGE_VERSION = 1

interface StorageData {
  version: number
  users: StoredUser[]
  lastUserId: string | null
}

const DEFAULT_DATA: StorageData = {
  version: STORAGE_VERSION,
  users: [],
  lastUserId: null
}

// Load users from localStorage
function loadUsers(): StorageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)

      // Version migration
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('User storage version mismatch, resetting')
        return { ...DEFAULT_DATA }
      }

      return {
        version: parsed.version || STORAGE_VERSION,
        users: Array.isArray(parsed.users) ? parsed.users : [],
        lastUserId: parsed.lastUserId || null
      }
    }
  } catch (error) {
    console.error('Failed to load users from localStorage:', error)
  }
  return { ...DEFAULT_DATA }
}

// Save users to localStorage
function saveUsers(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save users to localStorage:', error)
  }
}

// Global reactive state
const storageData = ref<StorageData>(loadUsers())

export function useMultiUserAuth() {
  const users = computed(() => storageData.value.users)
  const hasUsers = computed(() => storageData.value.users.length > 0)
  const lastUserId = computed(() => storageData.value.lastUserId)

  /**
   * Add or update user in storage
   */
  function saveUser(user: StoredUser): void {
    const existingIndex = storageData.value.users.findIndex(u => u.id === user.id)

    if (existingIndex >= 0) {
      // Update existing user
      storageData.value.users[existingIndex] = {
        ...user,
        lastLoginAt: new Date().toISOString()
      }
    } else {
      // Add new user
      storageData.value.users.push({
        ...user,
        lastLoginAt: new Date().toISOString()
      })
    }

    storageData.value.lastUserId = user.id
    saveUsers(storageData.value)
  }

  /**
   * Get user by ID
   */
  function getUserById(id: string): StoredUser | undefined {
    return storageData.value.users.find(u => u.id === id)
  }

  /**
   * Remove user from storage
   */
  function removeUser(id: string): void {
    storageData.value.users = storageData.value.users.filter(u => u.id !== id)

    if (storageData.value.lastUserId === id) {
      storageData.value.lastUserId =
        storageData.value.users.length > 0
          ? storageData.value.users[0].id
          : null
    }

    saveUsers(storageData.value)
  }

  /**
   * Clear all users
   */
  function clearAllUsers(): void {
    storageData.value = { ...DEFAULT_DATA }
    saveUsers(storageData.value)
  }

  /**
   * Get last logged in user
   */
  function getLastUser(): StoredUser | undefined {
    if (!storageData.value.lastUserId) return undefined
    return getUserById(storageData.value.lastUserId)
  }

  /**
   * Get users sorted by last login
   */
  const sortedUsers = computed(() => {
    return [...storageData.value.users].sort((a, b) => {
      return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
    })
  })

  return {
    users,
    sortedUsers,
    hasUsers,
    lastUserId,
    saveUser,
    getUserById,
    removeUser,
    clearAllUsers,
    getLastUser
  }
}
