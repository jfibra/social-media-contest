export interface Contest {
  id: number
  contest_name: string
  slug: string
  description: string
  logo_url: string
  poster_url: string
  start_time: string
  end_time: string
  entry_deadline: string | null
  max_entries_per_user: number
  visibility: "public" | "private"
  status: "active" | "ended" | "upcoming" | "canceled"
  memberid: string
  created_by: string | null
  created_at: string
  updated_at: string

  // These are mapped fields for our internal use
  name?: string
  startDate?: string
  endDate?: string
  logoUrl?: string
  posterUrl?: string
}

export interface ContestResponse {
  "0": Contest[]
  success: boolean
}

export interface ContestsResponse {
  "0": Contest[]
  success: boolean
}
