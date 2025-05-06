import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const loginUrl = `${API_BASE_URL}/verify-user-account` // Updated endpoint

    console.log(`API route: Attempting to login with email: ${body.email} to ${loginUrl}`)

    try {
      // Forward the request to the actual API
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      })

      console.log(`API route: Login response status: ${response.status} ${response.statusText}`)

      // Get the response as text first
      const responseText = await response.text()
      console.log(`API route: Response text: ${responseText}`)

      // Check if it's HTML
      if (
        responseText.trim().toLowerCase().startsWith("<!doctype") ||
        responseText.trim().toLowerCase().startsWith("<html")
      ) {
        console.error("API route: Received HTML response from external API")
        return NextResponse.json(
          {
            success: false,
            message: "Received HTML response from server. Please try again later.",
          },
          { status: 500 },
        )
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText)

        // Return the same status code as the external API
        return NextResponse.json(
          {
            success: response.ok,
            statusCode: response.status,
            apiResponse: data,
            message: response.ok ? "API call successful" : data.message || "API call failed",
          },
          { status: response.ok ? 200 : response.status },
        )
      } catch (parseError) {
        console.error("API route: Failed to parse response as JSON:", parseError)
        return NextResponse.json(
          {
            success: false,
            message: "Failed to parse server response. Please try again later.",
          },
          { status: 500 },
        )
      }
    } catch (fetchError) {
      console.error("API route: Fetch error:", fetchError)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to connect to authentication server: ${fetchError.message}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API route: Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
