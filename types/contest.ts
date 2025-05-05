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
  contest_rules?: string // New field
  prizes?: string // New field

  // These are mapped fields for our internal use
  name?: string
  startDate?: string
  endDate?: string
  logoUrl?: string
  posterUrl?: string
  rules?: string
  // prizes is already defined above
}

export interface ContestResponse {
  "0": Contest[]
  success: boolean
}

export interface ContestsResponse {
  "0": Contest[]
  success: boolean
}

export interface SubmissionFormData {
  contest_id: number
  name: string
  email: string
  phone: string
  fb_post_link: string
  initial_likes: number
  submission_time: string
  status: string
}

export interface SubmissionResponse {
  success: boolean
  message: string
}
