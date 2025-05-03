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
  visibility: string
  status: "active" | "completed" | "upcoming"
  memberid: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ContestResponse {
  "0": Contest[]
  success: boolean
}

export interface ContestsResponse {
  "0": Contest[]
  success: boolean
}
