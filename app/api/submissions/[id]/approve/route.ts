import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const submissionId = params.id
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || ""
    const body = await request.json()

    console.log(`[APPROVE] Approving submission ${submissionId}:`, body)
    console.log(`[APPROVE] API URL: ${API_BASE_URL}/scm/submissions/${submissionId}/approve`)
    console.log(`[APPROVE] Token present:`, !!token)

    const response = await fetch(`${API_BASE_URL}/scm/submissions/${submissionId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    // Get the raw response text first
    const responseText = await response.text()
    console.log(`[APPROVE] Raw response:`, responseText.substring(0, 200) + (responseText.length > 200 ? "..." : ""))

    let responseData
    try {
      // Only try to parse as JSON if it looks like JSON
      if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
        responseData = JSON.parse(responseText)
      } else {
        throw new Error(`Response is not JSON: ${responseText.substring(0, 100)}...`)
      }
    } catch (e) {
      console.error("[APPROVE] Error parsing response:", e)
      throw new Error(`Response is not valid JSON: ${responseText.substring(0, 100)}...`)
    }

    if (!response.ok) {
      throw new Error(`Failed to approve submission: ${response.status} - ${JSON.stringify(responseData)}`)
    }

    return NextResponse.json({
      success: true,
      message: "Submission approved successfully",
      data: responseData,
    })
  } catch (error) {
    console.error("[APPROVE] Error approving submission:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to approve submission: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
