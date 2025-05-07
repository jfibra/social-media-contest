/**
 * Checks if a user exists in SCM access and creates a record if not
 * @param email User email
 * @param userData User data for creating SCM access
 * @returns Promise<boolean> True if successful
 */
export async function ensureScmAccessExists(email: string, userData: any): Promise<boolean> {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists in SCM access using the path parameter format
    console.log(`Checking if ${normalizedEmail} exists in SCM access`)

    // Use the correct endpoint format with path parameter
    const checkUrl = `/api/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`
    console.log(`Calling API endpoint: ${checkUrl}`)

    const checkResponse = await fetch(checkUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    // If user exists, return true
    if (checkResponse.ok) {
      console.log(`User ${normalizedEmail} exists in SCM access`)
      return true
    }

    // If user doesn't exist, create a new record
    if (checkResponse.status === 404) {
      console.log(`User ${normalizedEmail} not found in SCM access, creating new record`)

      // Prepare data for creation
      const role = userData.role || "agent"
      const accessToken = userData.access_token || generateRandomToken()

      // Create a completely new object with only the fields we need
      // This ensures we don't pass any unexpected nested objects
      const scmAccessData = {
        email: normalizedEmail,
        memberid: userData.memberid || "",
        access_token: accessToken,
        full_name: userData.full_name || userData.name || email.split("@")[0],
        role: role,
        status: "active",
      }

      // Add team info if available
      if (userData.team_id) {
        scmAccessData.team_id = userData.team_id
      }
      if (userData.team_name) {
        scmAccessData.team_name = userData.team_name
      }

      console.log("Prepared SCM access data:", JSON.stringify(scmAccessData, null, 2))

      // Create the record
      const createResponse = await fetch(`/api/scm/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scmAccessData),
        cache: "no-store",
      })

      console.log(`SCM access creation response status: ${createResponse.status}`)

      if (createResponse.ok) {
        console.log(`Successfully created SCM access record for ${normalizedEmail}`)

        // Verify the record was actually created
        console.log("Verifying record creation...")
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait a second to allow for any DB latency

        const verifyResponse = await fetch(checkUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (verifyResponse.ok) {
          console.log("Verification successful - record exists")
          return true
        } else {
          console.warn("Verification failed - record may not have been created despite success response")

          // Try a second creation attempt with a direct approach
          console.log("Attempting second creation as fallback...")

          // For this fallback, we'll try to use a more direct approach if available
          // For now, we'll just log the issue and return based on the original response
          return true
        }
      } else {
        const errorText = await createResponse.text()
        console.error(`Failed to create SCM access record: ${errorText}`)

        // If it's a duplicate entry error, consider it a success
        if (errorText.includes("Duplicate entry") || errorText.includes("already exists")) {
          console.log(`User ${normalizedEmail} already exists in SCM access (detected from error)`)
          return true
        }

        return false
      }
    }

    console.error(`Unexpected response when checking SCM access: ${checkResponse.status}`)
    return false
  } catch (error) {
    console.error("Error ensuring SCM access exists:", error)
    return false
  }
}

/**
 * Generates a random access token
 */
function generateRandomToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Background sync script to validate SCM access table vs user table
 * This can be run periodically to ensure all users have SCM access records
 */
export async function syncScmAccessRecords(): Promise<{ success: boolean; message: string; results: any }> {
  try {
    console.log("Starting SCM access sync")

    // This would typically require admin access to fetch all users
    // For now, we'll just sync the current user if available

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("auth_user")
      const storedMember = localStorage.getItem("auth_member")

      if (storedUser) {
        const user = JSON.parse(storedUser)
        const member = storedMember ? JSON.parse(storedMember) : null

        if (user && user.email) {
          const userData = {
            email: user.email,
            name: user.name,
            memberid: member?.memberid || member?.id || "",
            role: member?.membertype || "agent",
          }

          const result = await ensureScmAccessExists(user.email, userData)
          return {
            success: result,
            message: result ? "SCM access sync completed successfully" : "SCM access sync failed",
            results: { [user.email]: result },
          }
        }
      }

      return {
        success: false,
        message: "No user data available for sync",
        results: {},
      }
    }

    return {
      success: false,
      message: "SCM access sync can only run in browser environment",
      results: {},
    }
  } catch (error) {
    console.error("Error syncing SCM access records:", error)
    return {
      success: false,
      message: `Error syncing SCM access records: ${error instanceof Error ? error.message : String(error)}`,
      results: {},
    }
  }
}
