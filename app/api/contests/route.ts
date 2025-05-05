import { NextResponse } from "next/server"
import { getAllContests } from "@/lib/api"

export async function GET() {
  try {
    const contests = await getAllContests()
    return NextResponse.json(contests)
  } catch (error) {
    console.error("Error in contests API route:", error)
    return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 })
  }
}
