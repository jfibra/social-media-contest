/**
 * Helper functions for SCM-related operations
 */

/**
 * Gets the memberid from SCM access data
 * First tries localStorage, then falls back to API
 */
export async function getScmMemberId(email: string | undefined, token?: string | null): Promise<string | null> {
  try {
    // First try to get from localStorage
    const scmAccessData = localStorage.getItem("scm_access")
    if (scmAccessData) {
      try {
        const scmAccess = JSON.parse(scmAccessData)
        if (scmAccess.memberid) {
          console.log("Using memberid from localStorage:", scmAccess.memberid)
          return scmAccess.memberid
        }
      } catch (e) {
        console.error("Error parsing SCM access data from localStorage:", e)
      }
    }

    // If not in localStorage, fetch from API
    if (!email) {
      throw new Error("User email not found")
    }

    console.log("Fetching SCM access data for email:", email)
    const response = await fetch(`/api/scm/access/find-by-email/${encodeURIComponent(email)}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch SCM access data: ${response.status}`)
    }

    const data = await response.json()
    if (data.success && data.data && data.data.memberid) {
      console.log("Fetched memberid from API:", data.data.memberid)
      // Store in localStorage for future use
      localStorage.setItem("scm_access", JSON.stringify(data.data))
      return data.data.memberid
    } else {
      throw new Error("SCM access data does not contain memberid")
    }
  } catch (error) {
    console.error("Error getting SCM memberid:", error)
    return null
  }
}

/**
 * Gets the full SCM access record
 * First tries localStorage, then falls back to API
 */
export async function getScmAccessData(email: string | undefined, token?: string | null): Promise<any | null> {
  try {
    // First try to get from localStorage
    const scmAccessData = localStorage.getItem("scm_access")
    if (scmAccessData) {
      try {
        const scmAccess = JSON.parse(scmAccessData)
        if (scmAccess.id) {
          console.log("Using SCM access data from localStorage")
          return scmAccess
        }
      } catch (e) {
        console.error("Error parsing SCM access data from localStorage:", e)
      }
    }

    // If not in localStorage, fetch from API
    if (!email) {
      throw new Error("User email not found")
    }

    console.log("Fetching SCM access data for email:", email)
    const response = await fetch(`/api/scm/access/find-by-email/${encodeURIComponent(email)}`, {
      method: "GET", // Explicitly set method to GET
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch SCM access data: ${response.status}`)
    }

    const data = await response.json()
    if (data.success && data.data) {
      console.log("Fetched SCM access data from API:", data.data)
      // Store in localStorage for future use
      localStorage.setItem("scm_access", JSON.stringify(data.data))
      return data.data
    } else {
      throw new Error("Failed to retrieve SCM access data")
    }
  } catch (error) {
    console.error("Error getting SCM access data:", error)
    return null
  }
}
