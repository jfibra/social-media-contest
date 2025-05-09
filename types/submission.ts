export interface Submission {
  id: number
  contest_id: number
  name: string
  email: string
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
    verified_by?: number
  }
  created_at: string
  updated_at: string
  ranking?: number
}

export interface SubmissionResponse {
  success: boolean
  message: string
}
