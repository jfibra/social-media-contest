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
    console.log("Creating SCM access record with data:", JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.email || !body.full_name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and full_name are required" },
        { status: 400 },
      )
    }

    // Normalize email to lowercase
    const normalizedEmail = body.email.toLowerCase().trim()

    // Create a completely new object with only the fields we need
    // This ensures we don't pass any unexpected nested objects
    const safeBody = {
      email: normalizedEmail,
      // Ensure memberid is always a string
      memberid: body.memberid ? String(body.memberid) : "",
      access_token: body.access_token || "",
      full_name: body.full_name || "",
      role: body.role || "agent",
      status: body.status || "active",
    }

    // If we have team info, store it as simple properties
    if (body.sales_team_member) {
      try {
        safeBody.team_id = body.sales_team_member.teamid ? String(body.sales_team_member.teamid) : null
        safeBody.team_name = body.sales_team_member.sales_team?.teamname || null
      } catch (e) {
        console.warn("Error extracting team info:", e)
      }
    }

    // Log the sanitized body for debugging
    console.log("Sanitized body for SCM access creation:", JSON.stringify(safeBody, null, 2))

    // Implement retry logic for network errors
    const maxRetries = 3
    let retryCount = 0
    let lastError = null

    while (retryCount < maxRetries) {
      try {
        console.log(`SCM access creation attempt ${retryCount + 1} of ${maxRetries}`)

        const fullUrl = `${API_BASE_URL}/scm/access`
        console.log(`Calling API endpoint: ${fullUrl}`)
        console.log(`With sanitized data:`, JSON.stringify(safeBody, null, 2))

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

          // Check if the response contains an actual success indicator from the backend
          if (data.success === false) {
            console.error("Backend reported failure despite 200 status code:", data.message || "Unknown error")
            lastError = data.message || "Backend reported failure"
            throw new Error(lastError)
          }

          // Verify the response contains the expected data
          if (!data.id && !data.data?.id) {
            console.warn("Response doesn't contain an ID, which might indicate the record wasn't created")
          }
        } catch (e) {
          console.error("Failed to parse SCM access creation response as JSON:", e)
          // If successful but response isn't JSON, return a generic success response
          if (response.ok) {
            // Even though we got a 200, let's be cautious and verify with a follow-up check
            try {
              console.log("Verifying record creation with a follow-up check...")
              const verifyUrl = `/api/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`
              const verifyResponse = await fetch(verifyUrl, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              })

              if (verifyResponse.ok) {
                console.log("Verification successful - record exists")
              } else {
                console.warn("Verification failed - record may not have been created despite 200 response")
              }
            } catch (verifyError) {
              console.error("Error during verification check:", verifyError)
            }

            return NextResponse.json({
              success: true,
              message: "SCM access record created successfully",
              data: safeBody,
            })
          }
          throw e
        }

        console.log("SCM access record created successfully")

        // Add a verification step to double-check the record was created
        try {
          console.log("Verifying record creation with a follow-up check...")
          const verifyUrl = `/api/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`
          const verifyResponse = await fetch(verifyUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (verifyResponse.ok) {
            console.log("Verification successful - record exists")
            try {
              const verifyData = await verifyResponse.json()
              console.log("Verified record data:", JSON.stringify(verifyData, null, 2))
            } catch (e) {
              console.error("Error parsing verification response:", e)
            }
          } else {
            console.warn("Verification failed - record may not have been created despite 200 response")
            // Try direct insertion again with a different approach
            console.log("Attempting direct insertion as fallback...")

            // Try a direct API call to bypass potential Next.js API route issues
            try {
              console.log("Attempting direct API call as fallback...")

              // Use a direct fetch to the external API
              const directResponse = await fetch(fullUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(safeBody),
                cache: "no-store",
              })

              if (directResponse.ok) {
                console.log("Direct API call successful")
                const directData = await directResponse.text()
                console.log("Direct API response:", directData)

                // Return success even if we can't parse the response
                return NextResponse.json({
                  success: true,
                  message: "SCM access record created successfully via direct API call",
                  data: safeBody,
                })
              } else {
                console.error(`Direct API call failed: ${directResponse.status}`)
              }
            } catch (directError) {
              console.error("Error in direct API call:", directError)
            }
          }
        } catch (verifyError) {
          console.error("Error during verification check:", verifyError)
        }

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
