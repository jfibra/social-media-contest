import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/app/env"

export async function GET(request: NextRequest, { params }: { params: { contestId: string } }) {
  try {
    const contestId = params.contestId
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || ""

    console.log(`Fetching submissions for contest ${contestId}`)

    const response = await fetch(`${API_BASE_URL}/scm/submissions/contest/${contestId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    let responseData
    try {
      const text = await response.text()
      responseData = text ? JSON.parse(text) : []
      console.log(`Fetch submissions response:`, responseData)
    } catch (e) {
      console.error("Error parsing response:", e)
      throw new Error(`Failed to parse response: ${e instanceof Error ? e.message : String(e)}`)
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch submissions: ${response.status} - ${JSON.stringify(responseData)}`)
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch submissions: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
