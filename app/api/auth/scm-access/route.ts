import { NextResponse } from "next/server"

// This is a compatibility layer for the old endpoint format
// It redirects to the new endpoint format

// Check if user exists in scm_access
export async function GET(request: Request) {
  console.log("=== LEGACY SCM ACCESS API ROUTE - GET REQUEST RECEIVED ===")
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    if (!email) {
      console.log("Email parameter missing in request")
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Normalize email to lowercase for consistent checking
    const normalizedEmail = email.toLowerCase().trim()

    console.log(`Legacy endpoint: Redirecting check for email: ${normalizedEmail} to new endpoint format`)

    // Redirect to the new endpoint format
    const response = await fetch(
      `${request.headers.get("origin")}/api/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    // Return the response from the new endpoint
    const responseText = await response.text()
    const status = response.status

    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data, { status })
    } catch (e) {
      return NextResponse.json({ success: false, message: responseText }, { status })
    }
  } catch (error) {
    console.error("Error in legacy SCM access endpoint:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}

// Create new scm_access record
export async function POST(request: Request) {
  console.log("=== LEGACY SCM ACCESS API ROUTE - POST REQUEST RECEIVED ===")
  try {
    const body = await request.json()
    console.log("Legacy endpoint: Redirecting SCM access creation to new endpoint format")

    // Forward to the new endpoint
    const response = await fetch(`${request.headers.get("origin")}/api/scm/access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Return the response from the new endpoint
    const responseText = await response.text()
    const status = response.status

    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data, { status })
    } catch (e) {
      return NextResponse.json({ success: false, message: responseText }, { status })
    }
  } catch (error) {
    console.error("Error in legacy SCM access endpoint:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
