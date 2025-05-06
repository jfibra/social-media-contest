import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

// Check if user exists in scm_access
export async function GET(request: Request) {
  console.log("=== SCM ACCESS API ROUTE - GET REQUEST RECEIVED ===")
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    if (!email) {
      console.log("Email parameter missing in request")
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Normalize email to lowercase for consistent checking
    const normalizedEmail = email.toLowerCase().trim()

    console.log(`Checking SCM access for email: ${normalizedEmail}`)

    // Construct full URL with path parameter instead of query parameter
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

// Create new scm_access record
export async function POST(request: Request) {
  console.log("=== SCM ACCESS API ROUTE - POST REQUEST RECEIVED ===")
  try {
    const body = await request.json()
    console.log("Creating SCM access record with data:", body)

    // Validate required fields
    if (!body.email || !body.full_name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and full_name are required" },
        { status: 400 },
      )
    }

    // Normalize email to lowercase
    const normalizedEmail = body.email.toLowerCase().trim()
    const safeBody = {
      ...body,
      email: normalizedEmail,
      role: body.role || "agent",
      status: body.status || "active",
    }

    // Remove any potentially problematic fields
    delete safeBody.team
    delete safeBody.subteam

    // First, check if the user already exists
    let userExists = false
    try {
      // Use the new path parameter format
      const checkUrl = `${API_BASE_URL}/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`
      console.log(`Checking if user exists before creation: ${checkUrl}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const checkResponse = await fetch(checkUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      console.log(`User existence check status: ${checkResponse.status}`)

      // If not 404, user might exist
      if (checkResponse.status !== 404) {
        const checkText = await checkResponse.text()
        console.log(`User existence check response: ${checkText}`)

        try {
          const checkData = JSON.parse(checkText)
          if (checkData && checkData.id) {
            console.log("User already exists in SCM access, skipping creation")
            userExists = true
            return NextResponse.json({
              success: true,
              message: "User already exists in SCM access",
              data: checkData,
            })
          }
        } catch (parseError) {
          console.log("Could not parse check response, continuing with creation")
        }
      }
    } catch (checkError) {
      console.error("Error checking if user exists before creation:", checkError)
      // Continue with creation attempt
    }

    // If user doesn't exist, create the record
    if (!userExists) {
      // Implement retry logic for network errors
      const maxRetries = 3
      let retryCount = 0
      let lastError = null

      while (retryCount < maxRetries) {
        try {
          console.log(`SCM access creation attempt ${retryCount + 1} of ${maxRetries}`)

          const fullUrl = `${API_BASE_URL}/scm/access`
          console.log(`Calling API endpoint: ${fullUrl}`)
          console.log(`With sanitized data:`, safeBody)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

          const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(safeBody),
            signal: controller.signal,
            cache: "no-store",
          })

          clearTimeout(timeoutId)

          console.log(`SCM access creation response status: ${response.status}`)

          const responseText = await response.text()
          console.log(`SCM access creation response body: ${responseText}`)

          // Check for duplicate entry error
          if (responseText.includes("Duplicate entry") || responseText.includes("already exists")) {
            console.log("User already exists in SCM access (detected from error message)")
            return NextResponse.json({
              success: true,
              message: "User already exists in SCM access",
              data: safeBody,
            })
          }

          if (!response.ok) {
            console.error(`Failed to create SCM access record: ${responseText}`)
            lastError = `Failed to create access record: ${responseText}`
            throw new Error(lastError)
          }

          // Try to parse the response as JSON
          let data
          try {
            data = JSON.parse(responseText)
          } catch (e) {
            console.error("Failed to parse SCM access creation response as JSON:", e)
            // If successful but response isn't JSON, return a generic success response
            if (response.ok) {
              return NextResponse.json({
                success: true,
                message: "SCM access record created successfully",
                data: safeBody,
              })
            }
            throw e
          }

          console.log("SCM access record created successfully")
          return NextResponse.json({ success: true, data })
        } catch (fetchError) {
          console.error(`Fetch error on attempt ${retryCount + 1}:`, fetchError)
          lastError = fetchError.message || "Unknown fetch error"

          // Only retry on network-related errors
          if (
            fetchError.message &&
            (fetchError.message.includes("fetch failed") ||
              fetchError.message.includes("network") ||
              fetchError.message.includes("timeout") ||
              fetchError.message.includes("abort"))
          ) {
            retryCount++
            if (retryCount < maxRetries) {
              console.log(`Retrying SCM access creation (attempt ${retryCount + 1})...`)
              // Exponential backoff: wait longer between retries
              await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount))
              continue
            }
          } else {
            // Non-network error, don't retry
            break
          }
        }
      }

      // If we get here, all retries failed
      console.error(`All ${maxRetries} attempts to create SCM access failed`)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create SCM access record after ${maxRetries} attempts: ${lastError}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error creating SCM access:", error)
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
