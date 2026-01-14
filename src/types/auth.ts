export interface User {
  id: string
  username: string
  createdAt: string
}

export interface StoredUser {
  id: string
  username: string
  jwt: string
  lastLoginAt: string
}

export interface AuthState {
  currentUser: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  username: string
  pin: string
}

export interface SignupCredentials {
  username: string
  pin: string
  projectKey: string
}

export interface AuthResponse {
  token: string
  userId: string
  username: string
}
