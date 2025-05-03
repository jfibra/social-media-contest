import { API_BASE_URL } from "@/app/env"
import type { Contest, ContestResponse, ContestsResponse } from "@/types/contest"

export async function getActiveContest(): Promise<Contest | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/scm/contests/active`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch active contest: ${response.status}`)
    }

    const data: ContestResponse = await response.json()

    if (!data.success || !data["0"] || data["0"].length === 0) {
      console.error("No active contest found or API error")
      return null
    }

    // Filter out canceled contests and private contests
    const validContests = data["0"].filter(
      (contest) => contest.status !== "canceled" && contest.visibility === "public",
    )

    if (validContests.length === 0) {
      console.error("No valid active contests found")
      return null
    }

    // Return the first valid contest in the array
    return {
      ...validContests[0],
      // Map the API fields to our internal field names for consistency
      name: validContests[0].contest_name,
      startDate: validContests[0].start_time,
      endDate: validContests[0].end_time,
      logoUrl: validContests[0].logo_url,
      posterUrl: validContests[0].poster_url,
    } as unknown as Contest
  } catch (error) {
    console.error("Error fetching active contest:", error)
    return null
  }
}

export async function getAllContests(): Promise<Contest[]> {
  try {
    // First try to get all contests from the API
    // We'll use the active endpoint since we know it works
    const response = await fetch(`${API_BASE_URL}/scm/contests/active`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch contests: ${response.status}`)
    }

    const data: ContestsResponse = await response.json()

    if (!data.success || !data["0"]) {
      console.error("No contests found or API error")
      return []
    }

    // Filter out private contests if not authorized
    const publicContests = data["0"].filter((contest) => contest.visibility === "public")

    // Map the API fields to our internal field names for consistency
    return publicContests.map((contest) => ({
      ...contest,
      name: contest.contest_name,
      startDate: contest.start_time,
      endDate: contest.end_time,
      logoUrl: contest.logo_url,
      posterUrl: contest.poster_url,
    })) as unknown as Contest[]
  } catch (error) {
    console.error("Error fetching contests:", error)
    return []
  }
}
