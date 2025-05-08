import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function POST(request: NextRequest) {
  try {
    const { contestId, scmAccessId } = await request.json()

    if (!contestId) {
      return NextResponse.json({ success: false, message: "Contest ID is required" }, { status: 400 })
    }

    // Get the token from the request headers
    const authHeader = request.headers.get("authorization")
    const token = authHeader ? authHeader.replace("Bearer ", "") : null

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication token is required" }, { status: 401 })
    }

    // Make the request to the API to delete the contest
    const response = await fetch(`${API_BASE_URL}/scm/contests/${contestId}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ performed_by: scmAccessId }), // Include the SCM access ID
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { success: false, message: `Failed to delete contest: ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error deleting contest:", error)
    return NextResponse.json({ success: false, message: `An unexpected error occurred: ${error}` }, { status: 500 })
  }
}
