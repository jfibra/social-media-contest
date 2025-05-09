"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { API_BASE_URL } from "@/app/env"
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  ExternalLink,
  ThumbsUp,
  Clock,
  ArrowLeft,
  Award,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { showErrorAlert, showSuccessAlert } from "@/lib/swal"
import Link from "next/link"
import type { Submission } from "@/types/submission"
import { SubmissionEditModal } from "@/components/submission-edit-modal"
import { VerifyLikesModal } from "@/components/verify-likes-modal"
import { getScmAccessData } from "@/lib/scm-helpers"

interface Contest {
  id: number
  contest_name: string
  slug: string
  description: string
  start_time: string
  end_time: string
  status: string
  visibility: string
}

export default function ContestSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.id as string
  const { user, member, token } = useAuth()

  const [contest, setContest] = useState<Contest | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [scmAccessId, setScmAccessId] = useState<number | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // State for modals
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)

  // State for ranking
  const [showRanking, setShowRanking] = useState(false)
  const [rankedSubmissions, setRankedSubmissions] = useState<Submission[]>([])

  // Function to get the SCM access ID
  const getScmAccessId = async () => {
    try {
      if (!user?.email) {
        throw new Error("User email not found")
      }

      // Get SCM access data from localStorage or API
      const scmAccessData = await getScmAccessData(user.email, token)

      if (scmAccessData && scmAccessData.id) {
        const accessId = Number.parseInt(scmAccessData.id, 10)
        console.log(`Using SCM access ID: ${accessId} for user ${user.email}`)
        setScmAccessId(accessId)
        return accessId
      } else {
        throw new Error("SCM access ID not found in user data")
      }
    } catch (error) {
      console.error("Error getting SCM access ID:", error)
      showErrorAlert(`Failed to retrieve user data: ${error instanceof Error ? error.message : String(error)}`)
      return null
    }
  }

  // Replace the separate fetchContest and fetchSubmissions functions with this combined function
  const fetchContestWithSubmissions = async () => {
    try {
      setRefreshing(true)
      setLoading(true)

      console.log(`Fetching contest data from: ${API_BASE_URL}/scm/contests/${contestId}/submission-management}`)
      console.log(`Token present:`, !!token)

      const response = await fetch(`${API_BASE_URL}/scm/contests/${contestId}/submission-management`, {
        method: "GET", // Explicitly set method to GET
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contest data: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched contest data:", data)

      if (data.contest) {
        setContest(data.contest)
      } else {
        throw new Error("Failed to fetch contest details")
      }

      if (data.submissions) {
        setSubmissions(data.submissions)

        // Create ranked submissions (only approved ones)
        const approved = data.submissions
          .filter((sub: Submission) => sub.status === "approved")
          .sort((a: Submission, b: Submission) => {
            const aLikes = a.verified_likes || a.initial_likes
            const bLikes = b.verified_likes || b.initial_likes
            return bLikes - aLikes
          })

        setRankedSubmissions(approved)
        setError(null)
      } else {
        // Fallback data for development
        const mockSubmissions = [
          {
            id: 1,
            contest_id: Number.parseInt(contestId),
            name: "John Doe",
            phone: "09171234567",
            fb_post_link: "https://facebook.com/post1",
            initial_likes: 150,
            verified_likes: 150,
            submission_time: new Date().toISOString(),
            status: "pending",
            likes_verification_json: {
              likes: 150,
              screenshot_url: "https://example.com/likeproof1.png",
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            contest_id: Number.parseInt(contestId),
            name: "Jane Smith",
            phone: "09187654321",
            fb_post_link: "https://facebook.com/post2",
            initial_likes: 200,
            verified_likes: 220,
            submission_time: new Date().toISOString(),
            status: "approved",
            likes_verification_json: {
              likes: 220,
              screenshot_url: "https://example.com/likeproof2.png",
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ] as Submission[]

        setSubmissions(mockSubmissions)

        // Create ranked submissions (only approved ones)
        const approved = mockSubmissions
          .filter((sub) => sub.status === "approved")
          .sort((a, b) => {
            const aLikes = a.verified_likes || a.initial_likes
            const bLikes = b.verified_likes || b.initial_likes
            return bLikes - aLikes
          })

        setRankedSubmissions(approved)
      }
    } catch (error) {
      console.error("Error fetching contest data:", error)
      setError(`Failed to load contest data: ${error instanceof Error ? error.message : String(error)}`)
      showErrorAlert(`Failed to load contest data: ${error instanceof Error ? error.message : String(error)}`)

      // Fallback data for development
      const mockSubmissions = [
        {
          id: 1,
          contest_id: Number.parseInt(contestId),
          name: "John Doe",
          phone: "09171234567",
          fb_post_link: "https://facebook.com/post1",
          initial_likes: 150,
          verified_likes: 150,
          submission_time: new Date().toISOString(),
          status: "pending",
          likes_verification_json: {
            likes: 150,
            screenshot_url: "https://example.com/likeproof1.png",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          contest_id: Number.parseInt(contestId),
          name: "Jane Smith",
          phone: "09187654321",
          fb_post_link: "https://facebook.com/post2",
          initial_likes: 200,
          verified_likes: 220,
          submission_time: new Date().toISOString(),
          status: "approved",
          likes_verification_json: {
            likes: 220,
            screenshot_url: "https://example.com/likeproof2.png",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ] as Submission[]

      setSubmissions(mockSubmissions)

      // Create ranked submissions (only approved ones)
      const approved = mockSubmissions
        .filter((sub) => sub.status === "approved")
        .sort((a, b) => {
          const aLikes = a.verified_likes || a.initial_likes
          const bLikes = b.verified_likes || b.initial_likes
          return bLikes - aLikes
        })

      setRankedSubmissions(approved)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await getScmAccessId()
      await fetchContestWithSubmissions()
    }

    init()
  }, [contestId, token])

  // Function to handle submission status change
  const handleStatusChange = async (submission: Submission, newStatus: "approved" | "rejected") => {
    if (!scmAccessId) {
      showErrorAlert("SCM Access ID not found. Please try logging in again.")
      return
    }

    try {
      setActionInProgress(`${newStatus}-${submission.id}`)

      // Prepare the payload - ensure updated_by is included for performed_by in logs
      const payload = {
        updated_by: scmAccessId, // Use scm_access_id
        performed_by: scmAccessId, // Use same ID for performed_by
        verified_likes:
          submission.verified_likes || submission.likes_verification_json?.likes || submission.initial_likes,
      }

      console.log(`Changing submission ${submission.id} status to ${newStatus}`, payload)
      console.log(`Using scm_access_id: ${scmAccessId} for updated_by and performed_by`)

      // Try direct API call to backend
      const directEndpoint =
        newStatus === "approved"
          ? `${API_BASE_URL}/scm/submissions/${submission.id}/approve`
          : `${API_BASE_URL}/scm/submissions/${submission.id}/reject`

      console.log(`Trying direct API call to: ${directEndpoint}`)
      console.log(`Method: POST`)
      console.log(`Headers:`, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      })
      console.log(`Body:`, JSON.stringify(payload))

      const response = await fetch(directEndpoint, {
        method: "POST", // Explicitly set method to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      // Get the raw response text first
      const responseText = await response.text()
      console.log(
        `[${newStatus.toUpperCase()}] Raw response:`,
        responseText.substring(0, 200) + (responseText.length > 200 ? "..." : ""),
      )

      if (!response.ok) {
        throw new Error(`Failed to update submission status: ${response.status} - ${responseText.substring(0, 100)}`)
      }

      showSuccessAlert(`Submission ${newStatus} successfully!`)
      fetchContestWithSubmissions() // Refresh the list
    } catch (error) {
      console.error(`Error ${newStatus} submission:`, error)
      showErrorAlert(`Failed to ${newStatus} submission: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setActionInProgress(null)
    }
  }

  // Function to open edit modal
  const openEditModal = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsEditModalOpen(true)
  }

  // Function to open verify likes modal
  const openVerifyModal = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsVerifyModalOpen(true)
  }

  // Function to handle submission update
  const handleSubmissionUpdate = async (updatedData: Partial<Submission>) => {
    if (!selectedSubmission) return

    if (!scmAccessId) {
      showErrorAlert("SCM Access ID not found. Please try logging in again.")
      return
    }

    try {
      setActionInProgress(`edit-${selectedSubmission.id}`)

      // Prepare the payload - ensure updated_by is included for performed_by in logs
      const payload = {
        ...updatedData,
        updated_by: scmAccessId, // Use scm_access_id
        performed_by: scmAccessId, // Use same ID for performed_by
      }

      console.log(`Updating submission ${selectedSubmission.id}:`, payload)
      console.log(`Using scm_access_id: ${scmAccessId} for updated_by and performed_by`)

      // Try direct API call to backend
      const directEndpoint = `${API_BASE_URL}/scm/submissions/${selectedSubmission.id}/update`
      console.log(`Trying direct API call to: ${directEndpoint}`)
      console.log(`Method: POST`)
      console.log(`Headers:`, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      })
      console.log(`Body:`, JSON.stringify(payload))

      const response = await fetch(directEndpoint, {
        method: "POST", // Explicitly set method to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      // Get the raw response text first
      const responseText = await response.text()
      console.log(`[UPDATE] Raw response:`, responseText.substring(0, 200) + (responseText.length > 200 ? "..." : ""))

      if (!response.ok) {
        throw new Error(`Failed to update submission: ${response.status} - ${responseText.substring(0, 100)}`)
      }

      showSuccessAlert("Submission updated successfully!")
      setIsEditModalOpen(false)
      fetchContestWithSubmissions() // Refresh the list
    } catch (error) {
      console.error("Error updating submission:", error)
      showErrorAlert(`Failed to update submission: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setActionInProgress(null)
    }
  }

  // Function to handle likes verification
  const handleVerifyLikes = async (verificationData: { likes: number; screenshot_url?: string }) => {
    if (!selectedSubmission) return

    if (!scmAccessId) {
      showErrorAlert("SCM Access ID not found. Please try logging in again.")
      return
    }

    try {
      setActionInProgress(`verify-${selectedSubmission.id}`)

      // Prepare the payload - ensure updated_by is included for performed_by in logs
      const payload = {
        verified_likes: verificationData.likes,
        likes_verification_json: {
          ...verificationData,
          verified_at: new Date().toISOString(),
          verified_by: scmAccessId,
        },
        updated_by: scmAccessId, // Use scm_access_id
        performed_by: scmAccessId, // Use same ID for performed_by
      }

      console.log(`Verifying likes for submission ${selectedSubmission.id}:`, payload)
      console.log(`Using scm_access_id: ${scmAccessId} for updated_by and performed_by`)

      // Try direct API call to backend
      const directEndpoint = `${API_BASE_URL}/scm/submissions/${selectedSubmission.id}/update`
      console.log(`Trying direct API call to: ${directEndpoint}`)
      console.log(`Method: POST`)
      console.log(`Headers:`, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      })
      console.log(`Body:`, JSON.stringify(payload))

      const response = await fetch(directEndpoint, {
        method: "POST", // Explicitly set method to POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      // Get the raw response text first
      const responseText = await response.text()
      console.log(`[VERIFY] Raw response:`, responseText.substring(0, 200) + (responseText.length > 200 ? "..." : ""))

      if (!response.ok) {
        throw new Error(`Failed to verify likes: ${response.status} - ${responseText.substring(0, 100)}`)
      }

      showSuccessAlert("Likes verified successfully!")
      setIsVerifyModalOpen(false)
      fetchContestWithSubmissions() // Refresh the list
    } catch (error) {
      console.error("Error verifying likes:", error)
      showErrorAlert(`Failed to verify likes: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setActionInProgress(null)
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "pending":
        return "bg-amber-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/user/contests" className="text-realty-primary hover:text-realty-secondary">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-2xl font-bold">{contest ? contest.contest_name : "Contest"} Submissions</h1>
            </div>
            <p className="text-realty-text">Manage and verify contest submissions.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchContestWithSubmissions}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-realty-secondary text-white rounded-md hover:bg-realty-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowRanking(!showRanking)}
              className={`flex items-center px-4 py-2 ${
                showRanking
                  ? "bg-realty-primary text-white"
                  : "bg-white text-realty-primary border border-realty-primary"
              } rounded-md hover:bg-realty-secondary hover:text-white transition-colors`}
            >
              <Award className="h-4 w-4 mr-2" />
              {showRanking ? "Show All Submissions" : "Show Ranking"}
            </button>
          </div>
        </div>

        {/* Debug info for development - only shown in development mode */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-3 bg-gray-100 rounded-md text-xs">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>SCM Access ID: {scmAccessId || "Not loaded yet"}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {showRanking && rankedSubmissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-amber-500" />
              Contest Ranking
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FB Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verified Likes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submission Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rankedSubmissions.map((submission, index) => (
                      <tr key={submission.id} className={index < 3 ? "bg-amber-50" : "hover:bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-lg font-bold ${
                              index === 0
                                ? "text-amber-500"
                                : index === 1
                                  ? "text-gray-500"
                                  : index === 2
                                    ? "text-amber-700"
                                    : "text-gray-700"
                            }`}
                          >
                            {submission.ranking || index + 1}
                            {(submission.ranking <= 3 || index < 3) && (
                              <span className="ml-2">
                                {submission.ranking === 1 || index === 0
                                  ? "🥇"
                                  : submission.ranking === 2 || index === 1
                                    ? "🥈"
                                    : "🥉"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-realty-primary">{submission.name}</div>
                          <div className="text-sm text-gray-500">{submission.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={submission.fb_post_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            View Post <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 text-blue-600 mr-1" />
                            <span className="font-semibold">
                              {submission.verified_likes ||
                                submission.likes_verification_json?.likes ||
                                submission.initial_likes}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(submission.submission_time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-realty-primary"></div>
          </div>
        ) : !showRanking && submissions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      FB Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-realty-primary">{submission.name}</div>
                        <div className="text-sm text-gray-500">{submission.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={submission.fb_post_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          View Post <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 mr-1">Initial:</span>
                            <span>{submission.initial_likes}</span>
                          </div>
                          {(submission.verified_likes || submission.likes_verification_json?.likes) && (
                            <div className="flex items-center text-green-600">
                              <span className="text-xs mr-1">Verified:</span>
                              <span className="font-semibold">
                                {submission.verified_likes || submission.likes_verification_json?.likes}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusBadgeColor(
                            submission.status,
                          )}`}
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(submission.submission_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(submission)}
                            className="text-amber-600 hover:text-amber-900 disabled:opacity-50"
                            title="Edit Submission"
                            disabled={actionInProgress !== null}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openVerifyModal(submission)}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Verify Likes"
                            disabled={actionInProgress !== null}
                          >
                            <ThumbsUp className="h-5 w-5" />
                          </button>
                          {submission.status !== "approved" && (
                            <button
                              onClick={() => handleStatusChange(submission, "approved")}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Approve Submission"
                              disabled={actionInProgress !== null}
                            >
                              {actionInProgress === `approved-${submission.id}` ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-5 w-5" />
                              )}
                            </button>
                          )}
                          {submission.status !== "rejected" && (
                            <button
                              onClick={() => handleStatusChange(submission, "rejected")}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Reject Submission"
                              disabled={actionInProgress !== null}
                            >
                              {actionInProgress === `rejected-${submission.id}` ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : !showRanking ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Submissions Found</h2>
            <p className="text-realty-text mb-6">This contest doesn't have any submissions yet.</p>
          </div>
        ) : null}
      </div>

      {/* Edit Submission Modal */}
      {selectedSubmission && (
        <SubmissionEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          submission={selectedSubmission}
          onSubmit={handleSubmissionUpdate}
        />
      )}

      {/* Verify Likes Modal */}
      {selectedSubmission && (
        <VerifyLikesModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          submission={selectedSubmission}
          onSubmit={handleVerifyLikes}
        />
      )}
    </div>
  )
}
