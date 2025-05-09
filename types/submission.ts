export interface Submission {
  id: number
  contest_id: number
  name: string
  email?: string
  phone: string
  fb_post_link: string
  initial_likes: number
  verified_likes?: number
  submission_time: string
  status: string
  likes_verification_json?: {
    likes: number
    screenshot_url: string
    verified_at?: string
    verified_by?: string
  }
  created_at: string
  updated_at: string
  ranking?: number
  updated_by?: string
}

export interface SubmissionResponse {
  success: boolean
  message: string
  data?: Submission
}

export interface SubmissionsResponse {
  success: boolean
  data: Submission[]
}

export interface LikesVerificationLog {
  id: number
  submission_id: number
  previous_likes: number
  new_likes: number
  verified_by: string
  verified_at: string
  screenshot_url?: string
}

export interface LikesVerificationLogResponse {
  success: boolean
  data: LikesVerificationLog[]
}
