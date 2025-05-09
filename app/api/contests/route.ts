import { NextResponse } from "next/server"
import { getAllContests } from "@/lib/api"

export const dynamic = "force-dynamic" // Disable caching for this route

export async function GET(request: Request) {
  try {
    // Get the includePrivate parameter from the URL
    const url = new URL(request.url)
    const includePrivate = url.searchParams.get("includePrivate") === "true"

    const contests = await getAllContests(includePrivate)
    return NextResponse.json(contests)
  } catch (error) {
    console.error("Error in contests API route:", error)
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 })
  }
}
