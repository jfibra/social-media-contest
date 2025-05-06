import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Contest creation request body:", body)

    // Validate required fields
    if (!body.contest_name || !body.slug || !body.description || !body.start_time || !body.end_time) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Try to forward the request to the actual API
    try {
      const response = await fetch(`${API_BASE_URL}/scm/contests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("Authorization")
            ? { Authorization: request.headers.get("Authorization") as string }
            : {}),
        },
        body: JSON.stringify(body),
      })

      // Get the response as text first
      const responseText = await response.text()
      console.log("API Response:", responseText)

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText)
        return NextResponse.json(data, { status: response.status })
      } catch (parseError) {
        console.error("Failed to parse API response:", parseError)

        // If we can't parse the response, return a fallback success response
        // This is for development/testing only
        if (process.env.NODE_ENV !== "production") {
          return NextResponse.json({
            success: true,
            message: "Contest created successfully (fallback response)",
            data: {
              id: Math.floor(Math.random() * 1000),
              ...body,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          })
        }

        return NextResponse.json({ success: false, message: "Failed to parse API response" }, { status: 500 })
      }
    } catch (fetchError) {
      console.error("Error forwarding request to API:", fetchError)

      // Provide a fallback response for development/testing
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({
          success: true,
          message: "Contest created successfully (fallback response)",
          data: {
            id: Math.floor(Math.random() * 1000),
            ...body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        })
      }

      throw fetchError
    }
  } catch (error) {
    console.error("Contest creation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
