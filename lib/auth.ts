import type { LoginCredentials, LoginResponse, ProfileResponse, LogoutResponse } from "@/types/auth"

// Helper function to check if a string is HTML
function isHtmlResponse(text: string): boolean {
  const trimmedText = text.trim().toLowerCase()
  return (
    trimmedText.startsWith("<!doctype") ||
    trimmedText.startsWith("<html") ||
    trimmedText.includes("<!doctype html>") ||
    trimmedText.includes("<head>") ||
    trimmedText.includes("<body")
  )
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    console.log(`Attempting to login with email: ${credentials.email}`)

    // Use our API route proxy
    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    console.log(`Login response status: ${response.status} ${response.statusText}`)

    // First check if the response is OK
    if (!response.ok) {
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}`,
      }
    }

    // Try to get the response as text first
    const responseText = await response.text()
    console.log(`Response text (first 100 chars): ${responseText.substring(0, 100)}...`)

    // Check if the response is HTML
    if (isHtmlResponse(responseText)) {
      console.error("Received HTML response instead of JSON")
      return {
        success: false,
        message: "Received HTML response from server. Please try again later.",
      }
    }

    // Try to parse the response as JSON
    try {
      const data = JSON.parse(responseText)
      console.log("Successfully parsed response as JSON")

      // Check if the login was successful based on the response structure
      if (data.success && data.apiResponse) {
        return {
          success: true,
          apiResponse: data.apiResponse,
          message: "Login successful",
        }
      } else {
        return {
          success: false,
          message: data.message || "Login failed. Invalid response format.",
        }
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)
      return {
        success: false,
        message: "Failed to parse server response. Please try again later.",
      }
    }
  } catch (error) {
    console.error("Login API error:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getProfile(token: string): Promise<ProfileResponse> {
  try {
    const response = await fetch(`/api/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}`,
      }
    }

    const responseText = await response.text()

    if (isHtmlResponse(responseText)) {
      console.error("Received HTML response instead of JSON")
      return {
        success: false,
        message: "Received HTML response from server. Please try again later.",
      }
    }

    try {
      const data = JSON.parse(responseText)

      if (data.success && data.data) {
        return {
          success: true,
          data: data.data,
        }
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch profile. Invalid response format.",
        }
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)
      return {
        success: false,
        message: "Failed to parse server response. Please try again later.",
      }
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
    const response = await fetch(`/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Server error: ${response.status} ${response.statusText}`,
      }
    }

    const responseText = await response.text()

    if (isHtmlResponse(responseText)) {
      console.error("Received HTML response instead of JSON")
      return {
        success: false,
        message: "Received HTML response from server. Please try again later.",
      }
    }

    try {
      const data = JSON.parse(responseText)
      return {
        success: true,
        data: { message: data.message || "Logged out successfully" },
      }
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)
      return {
        success: false,
        message: "Failed to parse server response. Please try again later.",
      }
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

// Helper function to check if user is an admin
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false

  try {
    const user = localStorage.getItem("auth_user")
    if (!user) return false

    const userData = JSON.parse(user)
    const member = localStorage.getItem("auth_member")

    if (member) {
      const memberData = JSON.parse(member)
      return memberData.membertype === "admin" || memberData.membertype === "superadmin"
    }

    // Fallback to role_id if available
    return userData.role_id === 1
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
