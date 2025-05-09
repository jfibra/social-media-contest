import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL_2 } from "@/app/env"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug
    console.log(`API: Fetching contest with slug: ${slug}`)

    // Add cache-busting query parameter
    const timestamp = new Date().getTime()
    const response = await fetch(`${API_BASE_URL_2}/contests/by-slug/${slug}?t=${timestamp}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`API: Failed to fetch contest by slug: ${response.status}`)
      return NextResponse.json({ success: false, error: "Failed to fetch contest" }, { status: response.status })
    }

    const data = await response.json()
    console.log(`API: Successfully fetched contest by slug: ${slug}`)

    return NextResponse.json({ success: true, contest: data })
  } catch (error) {
    console.error("API: Error fetching contest by slug:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
