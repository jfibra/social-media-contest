"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials, User, Member } from "@/types/auth"
import { login, logout, getProfile, isAdmin } from "@/lib/auth"
import { showErrorAlert, showSuccessAlert } from "@/lib/swal"

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

// Helper function to generate a random access token
function generateAccessToken(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Helper function to map roleId to role string
function mapRoleIdToRole(roleId: number): string {
  switch (roleId) {
    case 1:
      return "admin"
    case 4:
      return "agent"
    case 6:
      return "team leader"
    case 7:
      return "unit manager"
    default:
      return "agent" // Default to agent if unknown
  }
}

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

        // Show success message
        showSuccessAlert("Login successful!")

        // Redirect based on role
        if (isAdminUser) {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }

        return true
      }

      // Regular login flow
      const response = await login(credentials)

      if (response.success && response.apiResponse) {
        console.log("Login successful, processing user data:", response.apiResponse)

        // Extract user data from the response
        const userData = response.apiResponse

        // Generate a random access token
        const accessToken = generateAccessToken(32)

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
        const member: Member = {
          id: userData.details?.id || 0,
          memberid: userData.details?.memberid || "",
          email: userData.email || "",
          name: userData.name || "",
          status: userData.details?.status || "active",
        }

        // Store team information separately if needed
        const hasTeam = !!userData.details?.sales_team_member
        const teamInfo = hasTeam
          ? {
              teamId: userData.details?.sales_team_member?.teamid,
              teamName: userData.details?.sales_team_member?.sales_team?.teamname,
            }
          : null

        // Add this to localStorage if needed
        if (teamInfo) {
          localStorage.setItem("auth_team_info", JSON.stringify(teamInfo))
        }

        // Determine role based on roleId
        const roleId = userData.roleId || 4 // Default to agent (4) if not specified
        const role = mapRoleIdToRole(roleId)
        const isAdminUser = roleId === 1

        // Store token in localStorage - do this immediately to ensure we're logged in
        localStorage.setItem("auth_token", accessToken)
        localStorage.setItem("auth_user", JSON.stringify(user))
        localStorage.setItem("auth_member", JSON.stringify(member))

        // Update auth state
        setState({
          user,
          member,
          token: accessToken,
          isAuthenticated: true,
          isAdmin: isAdminUser,
          isLoading: false,
          error: null,
        })

        // Create SCM access record - always check with the server
        try {
          console.log("=== SCM ACCESS CHECK STARTING ===")
          console.log(`User authenticated: ${user.email}`)
          const normalizedEmail = userData.email.toLowerCase().trim()

          // Extract member ID safely
          let memberIdValue = ""
          try {
            if (userData.details?.memberid) {
              memberIdValue = userData.details.memberid.toString()
            }
          } catch (e) {
            console.warn("Error extracting memberid:", e)
          }

          // Create a simplified SCM access record
          const scmAccessData = {
            email: normalizedEmail,
            memberid: memberIdValue,
            access_token: accessToken,
            full_name: userData.name,
            role: role,
            status: "active",
          }

          console.log("SCM access data prepared:", scmAccessData)

          // First check if the user already exists - using the correct path parameter format
          console.log("Checking if user exists in SCM access database")

          // Use the correct endpoint format with path parameter
          const checkUrl = `/api/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`
          console.log(`Calling API endpoint: ${checkUrl}`)

          try {
            const checkResponse = await fetch(checkUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            })

            console.log(`SCM access check response status: ${checkResponse.status}`)

            if (checkResponse.status === 404) {
              // User doesn't exist, create the record
              console.log("User doesn't exist in SCM access, creating new record")

              try {
                const createResponse = await fetch("/api/scm/access", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(scmAccessData),
                })

                console.log(`SCM access creation response status: ${createResponse.status}`)

                if (createResponse.ok) {
                  console.log("SCM access record created successfully")

                  try {
                    const responseData = await createResponse.json()
                    console.log("SCM access creation response data:", responseData)
                  } catch (e) {
                    console.error("Error parsing SCM access creation response:", e)
                  }
                } else {
                  const errorText = await createResponse.text()
                  console.error(`Failed to create SCM access record: ${errorText}`)
                }
              } catch (createError) {
                console.error("Error creating SCM access record:", createError)
              }
            } else if (checkResponse.ok) {
              console.log("User already exists in SCM access database")

              try {
                const checkData = await checkResponse.json()
                console.log("Existing SCM access record:", checkData)
              } catch (e) {
                console.error("Error parsing SCM access check response:", e)
              }
            } else {
              console.error(`Unexpected response when checking SCM access: ${checkResponse.status}`)
            }
          } catch (checkError) {
            console.error("Error checking SCM access:", checkError)
          }

          console.log("=== SCM ACCESS CHECK COMPLETED ===")
        } catch (scmError) {
          console.error("Error handling SCM access record:", scmError)
          // Don't block login for SCM access errors
        }

        // Show success message
        showSuccessAlert("Login successful!")

        // Redirect based on role
        if (isAdminUser) {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }

        return true
      } else {
        console.error("Login failed:", response)

        // Show error message with SweetAlert
        const errorMessage = response.message || "Invalid credentials. Please try again."
        showErrorAlert(errorMessage)

        setState({
          ...initialState,
          isLoading: false,
          error: errorMessage,
        })

        return false
      }
    } catch (error) {
      console.error("Login error:", error)

      const errorMessage = "An unexpected error occurred. Please try again."
      showErrorAlert(errorMessage)

      setState({
        ...initialState,
        isLoading: false,
        error: errorMessage,
      })

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

      // Show success message
      showSuccessAlert("You have been logged out successfully")

      // Redirect to login page
      router.push("/auth/login")
    }
  }

  const clearError = () => {
    if (state.error) {
      setState((prev) => ({ ...prev, error: null }))
    }
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
