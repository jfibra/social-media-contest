export interface User {
  id: number
  name: string
  email: string
  role_id?: number
  created_at: string
  updated_at: string
}

export interface Member {
  id: number
  name?: string
  email: string
  phone?: string
  membertype?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface AuthState {
  user: User | null
  member: Member | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  auth?: boolean
}

export interface LoginResponse {
  success: boolean
  data?: any
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
