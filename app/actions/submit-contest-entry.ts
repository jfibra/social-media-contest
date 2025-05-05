"use server"

import { API_BASE_URL } from "@/app/env"
import type { SubmissionResponse } from "@/types/contest"
import { revalidatePath } from "next/cache"

export async function submitContestEntry(contestId: number, formData: FormData): Promise<SubmissionResponse> {
  try {
    // Extract form data
    const submission = {
      contest_id: contestId,
      name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone_number") as string,
      fb_post_link: formData.get("social_media_link") as string,
      initial_likes: Number.parseInt(formData.get("initial_likes") as string) || 0,
      submission_time: new Date().toISOString().slice(0, 19).replace("T", " "),
      status: "pending",
    }

    // Validate required fields
    if (!submission.name || !submission.email || !submission.phone || !submission.fb_post_link) {
      return {
        success: false,
        message: "Please fill in all required fields",
      }
    }

    // Validate initial_likes is a non-negative number
    if (isNaN(submission.initial_likes) || submission.initial_likes < 0) {
      return {
        success: false,
        message: "Please enter a valid number of likes",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(submission.email)) {
      return {
        success: false,
        message: "Please enter a valid email address",
      }
    }

    // Validate URL format for social media link
    try {
      new URL(submission.fb_post_link)
    } catch (e) {
      return {
        success: false,
        message: "Please enter a valid URL for your social media post",
      }
    }

    try {
      // Submit to API - using the correct endpoint from the provided API structure
      const response = await fetch(`${API_BASE_URL}/scm/submissions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
        cache: "no-store",
      })

      // Get the response as text first
      const responseText = await response.text()

      if (!response.ok) {
        // Try to parse as JSON if possible
        let errorMessage = `Failed to submit entry (Status: ${response.status}).`
        try {
          const errorData = JSON.parse(responseText)
          if (errorData.message) {
            errorMessage += ` ${errorData.message}`
          }
        } catch (e) {
          // If not JSON, include part of the response text
          if (responseText) {
            const truncated = responseText.substring(0, 100) + (responseText.length > 100 ? "..." : "")
            errorMessage += ` Server response: ${truncated}`
          }
        }

        return {
          success: false,
          message: errorMessage,
        }
      }

      // Try to parse the successful response as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse API response as JSON:", e)
        return {
          success: true,
          message: "Your entry has been submitted successfully, but we couldn't parse the server response.",
        }
      }

      // Revalidate the contest page to reflect the new submission
      revalidatePath(`/contests/[slug]`)

      return {
        success: true,
        message: "Your entry has been submitted successfully!",
      }
    } catch (error) {
      console.error("Error submitting contest entry:", error)
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      }
    }
  } catch (error) {
    console.error("Error in submitContestEntry:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
