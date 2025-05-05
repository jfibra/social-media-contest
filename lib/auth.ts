import { API_BASE_URL } from "@/app/env"
import type { LoginCredentials, LoginResponse, ProfileResponse, LogoutResponse } from "@/types/auth"

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    return {
      success: response.ok,
      data: response.ok ? data.data : undefined,
      message: !response.ok ? data.message || "Login failed" : undefined,
    }
  } catch (error) {
    console.error("Login API error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function getProfile(token: string): Promise<ProfileResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    return {
      success: response.ok,
      data: response.ok ? data.data : undefined,
      message: !response.ok ? data.message || "Failed to fetch profile" : undefined,
    }
  } catch (error) {
    console.error("Profile API error:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    }
  }
}

export async function logout(token: string): Promise<LogoutResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    return {
      success: response.ok,
      data: response.ok ? data.data : undefined,
      message: !response.ok ? data.message || "Logout failed" : undefined,
    }
  } catch (error) {
    console.error("Logout API error:", error)
    return {
      success: false,
      message: "An unexpected error occurred during logout.",
    }
  }
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("auth_token")
}
