import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function GET() {
  try {
    // Use the auth-login endpoint for testing
    const testUrl = `${API_BASE_URL}/auth-login`
    console.log(`Testing API connection to: ${testUrl}`)

    const response = await fetch(testUrl, {
      method: "HEAD", // Use HEAD request to just check if endpoint exists without fetching data
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (response.ok) {
      return NextResponse.json({
        status: "ok",
        message: "API is reachable",
        url: API_BASE_URL,
      })
    } else {
      return NextResponse.json({
        status: "error",
        message: `API returned status ${response.status} ${response.statusText}`,
        url: testUrl,
      })
    }
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: `Could not connect to API: ${error instanceof Error ? error.message : String(error)}`,
      url: API_BASE_URL,
    })
  }
}
