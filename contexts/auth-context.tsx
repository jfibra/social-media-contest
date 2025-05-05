"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials } from "@/types/auth"
import { login, logout, getProfile } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

const initialState: AuthState = {
  user: null,
  member: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)
  const router = useRouter()

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")

        if (!token) {
          setState({ ...initialState, isLoading: false })
          return
        }

        // Validate token by fetching profile
        const profileResponse = await getProfile(token)

        if (profileResponse.success && profileResponse.data) {
          setState({
            user: profileResponse.data.user,
            member: profileResponse.data.member,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } else {
          // Token is invalid, clear it
          localStorage.removeItem("auth_token")
          setState({ ...initialState, isLoading: false })
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        localStorage.removeItem("auth_token")
        setState({ ...initialState, isLoading: false })
      }
    }

    initializeAuth()
  }, [])

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await login(credentials)

      if (response.success && response.data) {
        const { user, member, token } = response.data

        // Store token in localStorage
        localStorage.setItem("auth_token", token)

        setState({
          user,
          member,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        return true
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.message || "Login failed",
        }))

        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "An unexpected error occurred. Please try again.",
      }))

      return false
    }
  }

  const handleLogout = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      if (state.token) {
        await logout(state.token)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear token from localStorage
      localStorage.removeItem("auth_token")

      // Reset state
      setState({ ...initialState, isLoading: false })

      // Redirect to login page
      router.push("/auth/login")
    }
  }

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }))
  }

  const value = {
    ...state,
    login: handleLogin,
    logout: handleLogout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
