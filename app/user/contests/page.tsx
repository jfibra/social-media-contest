"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { API_BASE_URL } from "@/app/env"
import { Plus, RefreshCw, Edit, Trash2, Eye, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "@/lib/swal"

interface Contest {
  id: number
  contest_name: string
  slug: string
  description: string
  start_time: string
  end_time: string
  status: string
  visibility: string
  created_at: string
  submissions?: any[]
}

export default function UserContestsPage() {
  const { user, member, token } = useAuth()
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [scmMemberId, setScmMemberId] = useState<string | null>(null)

  // Function to get the SCM access memberid
  const getScmMemberId = async () => {
    try {
      // First try to get from localStorage
      const scmAccessData = localStorage.getItem("scm_access")
      if (scmAccessData) {
        try {
          const scmAccess = JSON.parse(scmAccessData)
          if (scmAccess.memberid) {
            console.log("Using memberid from localStorage:", scmAccess.memberid)
            setScmMemberId(scmAccess.memberid)
            return scmAccess.memberid
          }
        } catch (e) {
          console.error("Error parsing SCM access data from localStorage:", e)
        }
      }

      // If not in localStorage, fetch from API
      const email = user?.email
      if (!email) {
        throw new Error("User email not found")
      }

      console.log("Fetching SCM access data for email:", email)
      const response = await fetch(`/api/scm/access/find-by-email/${encodeURIComponent(email)}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch SCM access data: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data && data.data.memberid) {
        console.log("Fetched memberid from API:", data.data.memberid)
        // Store in localStorage for future use
        localStorage.setItem("scm_access", JSON.stringify(data.data))
        setScmMemberId(data.data.memberid)
        return data.data.memberid
      } else {
        throw new Error("SCM access data does not contain memberid")
      }
    } catch (error) {
      console.error("Error getting SCM memberid:", error)
      return null
    }
  }

  const fetchContests = async () => {
    try {
      setRefreshing(true)

      // Get the correct memberid from SCM access
      const memberId = await getScmMemberId()

      if (!memberId) {
        throw new Error("SCM Member ID not found. Please try logging in again.")
      }

      console.log(`Fetching contests for SCM memberid: ${memberId}`)
      const response = await fetch(`${API_BASE_URL}/scm/contests/user/${memberId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contests: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data["0"]) {
        setContests(data["0"])
        setError(null)
      } else {
        // Fallback data for development
        setContests([
          {
            id: 1,
            contest_name: "Summer Promo Contest",
            slug: "summer-promo-contest",
            description: "Join our summer promo and win prizes!",
            start_time: "2025-05-01 00:00:00",
            end_time: "2025-05-31 23:59:59",
            status: "upcoming",
            visibility: "public",
            created_at: "2025-04-15 10:00:00",
            submissions: [
              { id: 1, name: "John Doe", status: "pending" },
              { id: 2, name: "Jane Smith", status: "approved" },
            ],
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching contests:", error)
      setError(`Failed to load contests: ${error instanceof Error ? error.message : String(error)}`)
      showErrorAlert(`Failed to load contests: ${error instanceof Error ? error.message : String(error)}`)

      // Fallback data for development
      setContests([
        {
          id: 1,
          contest_name: "Summer Promo Contest",
          slug: "summer-promo-contest",
          description: "Join our summer promo and win prizes!",
          start_time: "2025-05-01 00:00:00",
          end_time: "2025-05-31 23:59:59",
          status: "upcoming",
          visibility: "public",
          created_at: "2025-04-15 10:00:00",
          submissions: [],
        },
      ])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchContests()
  }, [token, member, user])

  const handleDeleteContest = async (id: number) => {
    const result = await showConfirmAlert(
      "Delete Contest",
      "Are you sure you want to delete this contest? This action cannot be undone.",
    )

    if (!result.isConfirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/scm/contests/${id}/delete`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete contest: ${response.status}`)
      }

      // Show success message
      showSuccessAlert("Contest deleted successfully!")

      // Refresh the contests list
      fetchContests()
    } catch (error) {
      console.error("Error deleting contest:", error)
      showErrorAlert("Failed to delete contest. Please try again later.")
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "upcoming":
        return "bg-realty-highlight"
      case "ended":
        return "bg-gray-500"
      case "canceled":
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
            <h1 className="text-2xl font-bold">My Contests</h1>
            <p className="text-realty-text">Create and manage your social media contests.</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchContests}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-realty-secondary text-white rounded-md hover:bg-realty-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/user/contests/create"
              className="flex items-center px-4 py-2 bg-realty-primary text-white rounded-md hover:bg-realty-secondary transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Contest
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-realty-primary"></div>
          </div>
        ) : contests.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contest Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contests.map((contest) => (
                    <tr key={contest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-realty-primary">{contest.contest_name}</div>
                        <div className="text-sm text-gray-500">{contest.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getStatusBadgeColor(
                            contest.status,
                          )}`}
                        >
                          {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(contest.start_time)}</div>
                        <div className="text-sm text-gray-500">to {formatDate(contest.end_time)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contest.visibility === "public"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {contest.visibility.charAt(0).toUpperCase() + contest.visibility.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contest.submissions ? contest.submissions.length : 0} submissions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/contests/${contest.slug}`}
                            className="text-realty-secondary hover:text-realty-primary"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/user/contests/${contest.id}/edit`}
                            className="text-amber-600 hover:text-amber-900"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteContest(contest.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Contests Found</h2>
            <p className="text-realty-text mb-6">You haven't created any contests yet.</p>
            <Link
              href="/user/contests/create"
              className="inline-flex items-center px-4 py-2 bg-realty-primary text-white rounded-md hover:bg-realty-secondary transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Contest
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
