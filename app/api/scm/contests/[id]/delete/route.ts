import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contestId = params.id
    const { performed_by, performed_by_id, performedBy, performedById, performer_id, user_id, scm_access_id } =
      await request.json()

    // Get the token from the request headers
    const authHeader = request.headers.get("authorization")
    const token = authHeader ? authHeader.replace("Bearer ", "") : null

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication token is required" }, { status: 401 })
    }

    // Log all possible IDs for debugging
    console.log("Delete contest params:", {
      contestId,
      performed_by,
      performed_by_id,
      performedBy,
      performedById,
      performer_id,
      user_id,
      scm_access_id,
    })

    // Use the first available ID
    const performerId =
      performed_by || performed_by_id || performedBy || performedById || performer_id || user_id || scm_access_id

    if (!performerId) {
      return NextResponse.json({ success: false, message: "Performer ID is required" }, { status: 400 })
    }

    // Make the request to the API to delete the contest
    const response = await fetch(`${API_BASE_URL}/scm/contests/${contestId}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ performed_by: performerId }),
    })

    const responseText = await response.text()
    console.log("Backend API response:", responseText)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Failed to delete contest: ${responseText}` },
        { status: response.status },
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.log("Response is not JSON:", responseText)
      data = { message: "Success (non-JSON response)" }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error deleting contest:", error)
    return NextResponse.json({ success: false, message: `An unexpected error occurred: ${error}` }, { status: 500 })
  }
}
