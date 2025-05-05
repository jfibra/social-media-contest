export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Member {
  id: number
  name: string
  email: string
  phone?: string
  role?: string
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  member: Member | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    user: User
    member: Member
    token: string
  }
  message?: string
}

export interface ProfileResponse {
  success: boolean
  data?: {
    user: User
    member: Member
  }
  message?: string
}

export interface LogoutResponse {
  success: boolean
  data?: {
    message: string
  }
  message?: string
}
