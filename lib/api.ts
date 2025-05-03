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

    // Return the first contest in the array
    return {
      ...data["0"][0],
      // Map the API fields to our internal field names for consistency
      name: data["0"][0].contest_name,
      startDate: data["0"][0].start_time,
      endDate: data["0"][0].end_time,
      logoUrl: data["0"][0].logo_url,
      posterUrl: data["0"][0].poster_url,
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

    // Map the API fields to our internal field names for consistency
    return data["0"].map((contest) => ({
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
