import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

// List all access records
export async function GET(request: Request) {
  console.log("=== SCM ACCESS API ROUTE - GET ALL REQUEST RECEIVED ===")
  try {
    const fullUrl = `${API_BASE_URL}/scm/access`
    console.log(`Calling API endpoint: ${fullUrl}`)

    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to get SCM access records: ${errorText}`)
      return NextResponse.json(
        { success: false, message: `Failed to get access records: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error getting SCM access records:", error)
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
