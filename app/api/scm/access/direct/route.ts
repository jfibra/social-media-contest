import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

// Direct API endpoint that bypasses the regular route handler
// This is a fallback for when the regular route handler fails
export async function POST(request: Request) {
  console.log("=== DIRECT SCM ACCESS API ROUTE - POST REQUEST RECEIVED ===")
  try {
    const body = await request.json()
    console.log("Direct API: Creating SCM access record with data:", JSON.stringify(body, null, 2))

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

    // Log the sanitized body for debugging
    console.log("Direct API: Sanitized body for SCM access creation:", JSON.stringify(safeBody, null, 2))

    // Make a direct API call to the external API
    const fullUrl = `${API_BASE_URL}/scm/access`
    console.log(`Direct API: Calling API endpoint: ${fullUrl}`)

    // Use a longer timeout for the direct API call
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(safeBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`Direct API: SCM access creation response status: ${response.status}`)

      const responseText = await response.text()
      console.log(`Direct API: SCM access creation response body: ${responseText}`)

      // Check for duplicate entry error
      if (responseText.includes("Duplicate entry") || responseText.includes("already exists")) {
        console.log("Direct API: User already exists in SCM access (detected from error message)")
        return NextResponse.json({
          success: true,
          message: "User already exists in SCM access",
          data: safeBody,
        })
      }

      if (!response.ok) {
        console.error(`Direct API: Failed to create SCM access record: ${responseText}`)
        return NextResponse.json(
          { success: false, message: `Failed to create access record: ${responseText}` },
          { status: response.status },
        )
      }

      // Try to parse the response as JSON
      try {
        const data = JSON.parse(responseText)
        console.log("Direct API: SCM access record created successfully")
        return NextResponse.json({ success: true, data })
      } catch (e) {
        console.error("Direct API: Failed to parse SCM access creation response as JSON:", e)
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
    } catch (fetchError) {
      console.error("Direct API: Fetch error:", fetchError)
      return NextResponse.json(
        { success: false, message: `Failed to create access record: ${fetchError.message}` },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Direct API: Error creating SCM access:", error)
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
