import { NextResponse } from "next/server"
import { getAllContests } from "@/lib/api"

export const dynamic = "force-dynamic" // Disable caching for this route

export async function GET(request: Request) {
  try {
    // Get the includePrivate parameter from the URL
    const url = new URL(request.url)
    const includePrivate = url.searchParams.get("includePrivate") === "true"

    console.log(`API: Fetching all contests (includePrivate: ${includePrivate})`)

    const contests = await getAllContests(includePrivate)

    console.log(`API: Returning ${contests.length} contests`)

    // Log each contest for debugging
    contests.forEach((contest, index) => {
      console.log(`API: Contest ${index}: ${contest.name}, slug: ${contest.slug}, visibility: ${contest.visibility}`)
    })

    return NextResponse.json(contests)
  } catch (error) {
    console.error("Error in contests API route:", error)
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 })
  }
}
