import { API_BASE_URL } from "@/app/env"
import type { Contest, ContestResponse, ContestsResponse } from "@/types/contest"

export async function getActiveContest(includePrivate = false): Promise<Contest | null> {
  try {
    // Add cache-busting query parameter to prevent caching
    const timestamp = new Date().getTime()
    const response = await fetch(`${API_BASE_URL}/scm/contests/active?t=${timestamp}`, {
      cache: "no-store", // Disable caching
      next: { revalidate: 0 }, // Disable revalidation
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch active contest: ${response.status}`)
    }

    const data: ContestResponse = await response.json()

    if (!data.success || !data["0"] || data["0"].length === 0) {
      console.error("No active contest found or API error")
      return null
    }

    // Filter contests based on visibility parameter
    const contests = data["0"]
      .filter((contest) => includePrivate || contest.visibility === "public")
      .map((contest) => ({
        ...contest,
        name: contest.contest_name,
        startDate: contest.start_time,
        endDate: contest.end_time,
        logoUrl: contest.logo_url,
        posterUrl: contest.poster_url,
        rules: contest.contest_rules, // Map new field
        prizes: contest.prizes, // Map new field
      }))

    // First try to find an active contest
    let selectedContest = contests.find((contest) => contest.status === "active")

    // If no active contest, try to find an upcoming contest
    if (!selectedContest) {
      selectedContest = contests.find((contest) => contest.status === "upcoming")
    }

    // If still no contest found, return null
    if (!selectedContest) {
      return null
    }

    return selectedContest as unknown as Contest
  } catch (error) {
    console.error("Error fetching active contest:", error)
    return null
  }
}

export async function getAllContests(includePrivate = false): Promise<Contest[]> {
  try {
    // Add cache-busting query parameter to prevent caching
    const timestamp = new Date().getTime()
    const response = await fetch(`${API_BASE_URL}/scm/contests/active?t=${timestamp}`, {
      cache: "no-store", // Disable caching
      next: { revalidate: 0 }, // Disable revalidation
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch contests: ${response.status}`)
    }

    const data: ContestsResponse = await response.json()

    if (!data.success || !data["0"]) {
      console.error("No contests found or API error")
      return []
    }

    // Filter contests based on visibility parameter
    return data["0"]
      .filter((contest) => includePrivate || contest.visibility === "public")
      .map((contest) => ({
        ...contest,
        name: contest.contest_name,
        startDate: contest.start_time,
        endDate: contest.end_time,
        logoUrl: contest.logo_url,
        posterUrl: contest.poster_url,
        rules: contest.contest_rules, // Map new field
        prizes: contest.prizes, // Map new field
      })) as unknown as Contest[]
  } catch (error) {
    console.error("Error fetching contests:", error)
    return []
  }
}

// Helper function to check if a contest is currently accepting submissions
export function isContestAcceptingSubmissions(contest: Contest): boolean {
  if (!contest) return false

  const now = new Date()
  const startDate = new Date(contest.startDate || contest.start_time)
  const endDate = new Date(contest.endDate || contest.end_time)

  // If contest is active, it's accepting submissions
  if (contest.status === "active") return true

  // If contest is upcoming but within date range, it's accepting submissions
  if (contest.status === "upcoming" && now >= startDate && now <= endDate) return true

  return false
}
