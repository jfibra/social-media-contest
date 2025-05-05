"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials, User, Member } from "@/types/auth"
import { login, logout, getProfile, isAdmin } from "@/lib/auth"

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
  isAdmin: false,
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
        const storedUser = localStorage.getItem("auth_user")
        const storedMember = localStorage.getItem("auth_member")

        if (!token || !storedUser) {
          setState({ ...initialState, isLoading: false })
          return
        }

        // Parse stored user data
        const user = JSON.parse(storedUser)
        const member = storedMember ? JSON.parse(storedMember) : null
        const adminStatus = isAdmin()

        // Set initial state from localStorage
        setState({
          user,
          member,
          token,
          isAuthenticated: true,
          isAdmin: adminStatus,
          isLoading: false,
          error: null,
        })

        // Optionally validate token by fetching profile
        try {
          const profileResponse = await getProfile(token)

          if (!profileResponse.success) {
            // Token might be invalid, but don't log out immediately
            console.warn("Failed to validate token:", profileResponse.message)
          }
        } catch (profileError) {
          console.warn("Error validating token:", profileError)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        localStorage.removeItem("auth_member")
        setState({ ...initialState, isLoading: false })
      }
    }

    initializeAuth()
  }, [])

  // Update the handleLogin function to handle the new response structure
  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Special handling for demo accounts
      if (
        (credentials.email === "admin@example.com" || credentials.email === "user@example.com") &&
        credentials.password === "password"
      ) {
        console.log(`Using demo account login for ${credentials.email}`)

        // Create demo user data
        const isAdminUser = credentials.email === "admin@example.com"

        const demoUser: User = {
          id: isAdminUser ? 999 : 998,
          name: isAdminUser ? "Demo Admin" : "Demo User",
          email: credentials.email,
          role_id: isAdminUser ? 1 : 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const demoMember: Member = {
          id: isAdminUser ? 12345 : 12346,
          email: credentials.email,
          name: isAdminUser ? "Demo Admin" : "Demo User",
          membertype: isAdminUser ? "admin" : "user",
          status: "active",
        }

        const demoToken = "demo-token-" + Date.now()

        // Store in localStorage
        localStorage.setItem("auth_token", demoToken)
        localStorage.setItem("auth_user", JSON.stringify(demoUser))
        localStorage.setItem("auth_member", JSON.stringify(demoMember))

        // Update state
        setState({
          user: demoUser,
          member: demoMember,
          token: demoToken,
          isAuthenticated: true,
          isAdmin: isAdminUser,
          isLoading: false,
          error: null,
        })

        return true
      }

      // Regular login flow
      const response = await login(credentials)

      if (response.success && response.data) {
        // Extract user and token from the new response structure
        const userData = response.data["0"] || {}
        const authToken = response.data.authToken || ""

        // Create user object from the response
        const user: User = {
          id: userData.id || 0,
          name: userData.name || "",
          email: userData.email || "",
          role_id: userData.roleId || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Create member object from the response
        const member: Member = userData.details || {
          id: userData.id || 0,
          email: userData.email || "",
          name: userData.name || "",
          membertype: userData.roleId === 1 ? "admin" : "user",
          status: "active",
        }

        // Store token in localStorage
        localStorage.setItem("auth_token", authToken)
        localStorage.setItem("auth_user", JSON.stringify(user))
        localStorage.setItem("auth_member", JSON.stringify(member))

        const adminStatus = user.role_id === 1 || member.membertype === "admin" || member.membertype === "superadmin"

        setState({
          user,
          member,
          token: authToken,
          isAuthenticated: true,
          isAdmin: adminStatus,
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
      if (state.token && !state.token.startsWith("demo-token")) {
        await logout(state.token)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_member")

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
