import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function POST(request: Request) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Authorization header missing" }, { status: 401 })
    }

    // Forward the request to the actual API
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      cache: "no-store",
    })

    // Get the response as text first
    const responseText = await response.text()

    // Check if it's HTML
    if (
      responseText.trim().toLowerCase().startsWith("<!doctype") ||
      responseText.trim().toLowerCase().startsWith("<html")
    ) {
      console.error("API route: Received HTML response from external API")
      return NextResponse.json({ success: false, message: "External API returned an HTML response" }, { status: 500 })
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error("API route: Failed to parse response as JSON:", parseError)
      return NextResponse.json({ success: false, message: "Failed to parse external API response" }, { status: 500 })
    }
  } catch (error) {
    console.error("API route: Logout error:", error)
    return NextResponse.json({ success: false, message: "An unexpected error occurred" }, { status: 500 })
  }
}
