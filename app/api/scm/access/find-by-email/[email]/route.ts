import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

// Check if user exists in scm_access by email (path parameter)
export async function GET(request: Request, { params }: { params: { email: string } }) {
  console.log("=== SCM ACCESS FIND BY EMAIL API ROUTE - GET REQUEST RECEIVED ===")
  try {
    const email = params.email

    if (!email) {
      console.log("Email parameter missing in request")
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Normalize email to lowercase for consistent checking
    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim()

    console.log(`Checking SCM access for email: ${normalizedEmail}`)

    // Construct full URL with path parameter
    const fullUrl = `${API_BASE_URL}/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`
    console.log(`Calling API endpoint: ${fullUrl}`)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      console.log(`SCM access check response status: ${response.status}`)

      // If user not found, API returns 404
      if (response.status === 404) {
        console.log(`User not found in SCM access database. Email: ${normalizedEmail}`)
        return NextResponse.json({ success: false, exists: false, message: "User not found" }, { status: 404 })
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to check SCM access: ${errorText}`)
        return NextResponse.json(
          { success: false, message: `Failed to check user access: ${response.status}` },
          { status: response.status },
        )
      }

      // Try to parse the response
      try {
        const responseText = await response.text()
        console.log(`SCM access check raw response: ${responseText}`)

        // Check if the response is empty or not valid JSON
        if (!responseText || responseText.trim() === "") {
          console.log("Empty response from SCM access check, treating as user not found")
          return NextResponse.json(
            { success: false, exists: false, message: "User not found (empty response)" },
            { status: 404 },
          )
        }

        const data = JSON.parse(responseText)

        // Check if the data indicates the user exists
        if (data && data.message === "User not found") {
          console.log("API indicates user does not exist")
          return NextResponse.json(
            { success: false, exists: false, message: "User not found (API response)" },
            { status: 404 },
          )
        }

        console.log("SCM access check successful, user exists")
        return NextResponse.json({ success: true, exists: true, data })
      } catch (parseError) {
        console.error("Error parsing SCM access check response:", parseError)
        return NextResponse.json({ success: false, exists: false, message: "Error parsing response" }, { status: 500 })
      }
    } catch (fetchError) {
      console.error("Fetch error when checking SCM access:", fetchError)
      // Return a default response to allow the login process to continue
      return NextResponse.json(
        { success: false, exists: false, message: `Error checking user existence: ${fetchError.message}` },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error checking SCM access:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
