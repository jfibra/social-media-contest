import { NextResponse } from "next/server"

// This is a mock login endpoint for testing when the real API is not available
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check credentials (for demo purposes)
    if (body.email === "admin@example.com" && body.password === "password") {
      return NextResponse.json({
        success: true,
        "0": {
          user: {
            id: 999,
            name: "Demo Admin",
            email: "admin@example.com",
            auth_timestamp: Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role_id: 1,
          },
          member: {
            id: 12345,
            memberid: 1003220999,
            email: "admin@example.com",
            fn: "Demo",
            ln: "Admin",
            status: "active",
            membertype: "admin",
          },
          token: "mock-token-" + Date.now(),
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
