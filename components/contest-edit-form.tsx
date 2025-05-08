"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { API_BASE_URL } from "@/app/env"
import { useAuth } from "@/contexts/auth-context"
import { showErrorAlert, showSuccessAlert } from "@/lib/swal"
import { FileUploader } from "@/components/file-uploader"
import { AlertCircle, Loader2 } from "lucide-react"

// Form schema
const contestSchema = z.object({
  contest_name: z.string().min(3, "Contest name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contest_rules: z.string().min(10, "Rules must be at least 10 characters"),
  prizes: z.string().min(5, "Prizes must be at least 5 characters"),
  logo_url: z.string().url("Logo URL must be a valid URL"),
  poster_url: z.string().url("Poster URL must be a valid URL"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  entry_deadline: z.string().min(1, "Entry deadline is required"),
  max_entries_per_user: z.number().min(1, "Maximum entries must be at least 1"),
  visibility: z.enum(["public", "private"]),
  status: z.enum(["active", "upcoming", "ended", "canceled"]),
})

type ContestFormValues = z.infer<typeof contestSchema>

interface ContestEditFormProps {
  contestId: number
  isAdmin: boolean
}

export default function ContestEditForm({ contestId, isAdmin }: ContestEditFormProps) {
  const router = useRouter()
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scmAccessId, setScmAccessId] = useState<number | null>(null)
  const [memberid, setMemberid] = useState<string | null>(null)
  const [slugManuallyChanged, setSlugManuallyChanged] = useState(false)

  // Initialize form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContestFormValues>({
    resolver: zodResolver(contestSchema),
    defaultValues: {
      max_entries_per_user: 1,
      visibility: "public",
      status: "upcoming",
    },
  })

  const contestName = watch("contest_name")

  // Get SCM Access ID for the logged-in user
  useEffect(() => {
    const getScmAccessId = async () => {
      try {
        // First try to get from localStorage
        const scmAccessData = localStorage.getItem("scm_access")
        if (scmAccessData) {
          try {
            const scmAccess = JSON.parse(scmAccessData)
            if (scmAccess.id) {
              console.log("Using SCM Access ID from localStorage:", scmAccess.id)
              setScmAccessId(scmAccess.id)
              if (scmAccess.memberid) {
                setMemberid(scmAccess.memberid)
              }
              return scmAccess.id
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
        if (data.success && data.data && data.data.id) {
          console.log("Fetched SCM Access ID from API:", data.data.id)
          // Store in localStorage for future use
          localStorage.setItem("scm_access", JSON.stringify(data.data))
          setScmAccessId(data.data.id)
          if (data.data.memberid) {
            setMemberid(data.data.memberid)
          }
          return data.data.id
        } else {
          throw new Error("SCM access data does not contain ID")
        }
      } catch (error) {
        console.error("Error getting SCM Access ID:", error)
        return null
      }
    }

    getScmAccessId()
  }, [user, token])

  // Fetch contest data
  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/scm/contests/${contestId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch contest: ${response.status}`)
        }

        const data = await response.json()

        // Format dates for form inputs
        const formatDateForInput = (dateString: string) => {
          try {
            return dateString ? format(new Date(dateString), "yyyy-MM-dd HH:mm:ss") : ""
          } catch (e) {
            console.error("Error formatting date:", e)
            return dateString
          }
        }

        // Set form values
        setValue("contest_name", data.contest_name)
        setValue("slug", data.slug)
        setValue("description", data.description)
        setValue("contest_rules", data.contest_rules || "")
        setValue("prizes", data.prizes || "")
        setValue("logo_url", data.logo_url || "")
        setValue("poster_url", data.poster_url || "")
        setValue("start_time", formatDateForInput(data.start_time))
        setValue("end_time", formatDateForInput(data.end_time))
        setValue("entry_deadline", formatDateForInput(data.entry_deadline || data.end_time))
        setValue("max_entries_per_user", data.max_entries_per_user || 1)
        setValue("visibility", data.visibility || "public")
        setValue("status", data.status || "upcoming")

        // Store memberid if available
        if (data.memberid) {
          setMemberid(data.memberid)
        }

        setError(null)
      } catch (error) {
        console.error("Error fetching contest:", error)
        setError(`Failed to load contest: ${error instanceof Error ? error.message : String(error)}`)
        showErrorAlert(`Failed to load contest: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    if (contestId) {
      fetchContest()
    }
  }, [contestId, token, setValue])

  // Auto-generate slug from contest name if not manually changed
  useEffect(() => {
    if (contestName && !slugManuallyChanged) {
      const slug = contestName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
      setValue("slug", slug)
    }
  }, [contestName, setValue, slugManuallyChanged])

  // Handle form submission
  const onSubmit = async (data: ContestFormValues) => {
    if (!scmAccessId) {
      showErrorAlert("User ID not found. Please try logging in again.")
      return
    }

    setSubmitting(true)

    try {
      // Prepare the payload
      const payload = {
        ...data,
        memberid: memberid || "",
        updated_by: scmAccessId.toString(), // Use the correct SCM Access ID
      }

      console.log("Updating contest with payload:", payload)

      // Send the update request
      const response = await fetch(`${API_BASE_URL}/scm/contests/${contestId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update contest: ${response.status} - ${errorText}`)
      }

      // Show success message
      showSuccessAlert("Contest updated successfully!")

      // Redirect to the contests list
      setTimeout(() => {
        router.push(isAdmin ? "/admin/contests" : "/user/contests")
      }, 1500)
    } catch (error) {
      console.error("Error updating contest:", error)
      showErrorAlert(`Failed to update contest: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle logo URL update
  const handleLogoUrlChange = (url: string) => {
    setValue("logo_url", url)
  }

  // Handle poster URL update
  const handlePosterUrlChange = (url: string) => {
    setValue("poster_url", url)
  }

  // Handle slug manual change
  const handleSlugChange = () => {
    setSlugManuallyChanged(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-realty-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contest Name */}
          <div className="space-y-2">
            <label htmlFor="contest_name" className="block text-sm font-medium text-gray-700">
              Contest Name*
            </label>
            <input
              id="contest_name"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("contest_name")}
            />
            {errors.contest_name && <p className="text-red-500 text-sm">{errors.contest_name.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug* (URL-friendly name)
            </label>
            <input
              id="slug"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("slug")}
              onChange={handleSlugChange}
            />
            {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description*
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("description")}
            ></textarea>
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          {/* Contest Rules */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="contest_rules" className="block text-sm font-medium text-gray-700">
              Contest Rules*
            </label>
            <textarea
              id="contest_rules"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("contest_rules")}
            ></textarea>
            {errors.contest_rules && <p className="text-red-500 text-sm">{errors.contest_rules.message}</p>}
          </div>

          {/* Prizes */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="prizes" className="block text-sm font-medium text-gray-700">
              Prizes*
            </label>
            <textarea
              id="prizes"
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("prizes")}
            ></textarea>
            {errors.prizes && <p className="text-red-500 text-sm">{errors.prizes.message}</p>}
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
              Logo URL*
            </label>
            <div className="flex flex-col space-y-2">
              <input
                id="logo_url"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
                {...register("logo_url")}
              />
              <FileUploader
                onFileUploaded={handleLogoUrlChange}
                acceptedFileTypes="image/*"
                maxSizeMB={2}
                buttonText="Upload Logo"
                currentFileUrl={watch("logo_url")}
              />
            </div>
            {errors.logo_url && <p className="text-red-500 text-sm">{errors.logo_url.message}</p>}
          </div>

          {/* Poster URL */}
          <div className="space-y-2">
            <label htmlFor="poster_url" className="block text-sm font-medium text-gray-700">
              Poster URL*
            </label>
            <div className="flex flex-col space-y-2">
              <input
                id="poster_url"
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
                {...register("poster_url")}
              />
              <FileUploader
                onFileUploaded={handlePosterUrlChange}
                acceptedFileTypes="image/*"
                maxSizeMB={5}
                buttonText="Upload Poster"
                currentFileUrl={watch("poster_url")}
              />
            </div>
            {errors.poster_url && <p className="text-red-500 text-sm">{errors.poster_url.message}</p>}
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
              Start Time* (YYYY-MM-DD HH:MM:SS)
            </label>
            <input
              id="start_time"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              placeholder="YYYY-MM-DD HH:MM:SS"
              {...register("start_time")}
            />
            {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time.message}</p>}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
              End Time* (YYYY-MM-DD HH:MM:SS)
            </label>
            <input
              id="end_time"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              placeholder="YYYY-MM-DD HH:MM:SS"
              {...register("end_time")}
            />
            {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time.message}</p>}
          </div>

          {/* Entry Deadline */}
          <div className="space-y-2">
            <label htmlFor="entry_deadline" className="block text-sm font-medium text-gray-700">
              Entry Deadline* (YYYY-MM-DD HH:MM:SS)
            </label>
            <input
              id="entry_deadline"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              placeholder="YYYY-MM-DD HH:MM:SS"
              {...register("entry_deadline")}
            />
            {errors.entry_deadline && <p className="text-red-500 text-sm">{errors.entry_deadline.message}</p>}
          </div>

          {/* Max Entries Per User */}
          <div className="space-y-2">
            <label htmlFor="max_entries_per_user" className="block text-sm font-medium text-gray-700">
              Max Entries Per User*
            </label>
            <input
              id="max_entries_per_user"
              type="number"
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("max_entries_per_user", { valueAsNumber: true })}
            />
            {errors.max_entries_per_user && (
              <p className="text-red-500 text-sm">{errors.max_entries_per_user.message}</p>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
              Visibility*
            </label>
            <select
              id="visibility"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("visibility")}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            {errors.visibility && <p className="text-red-500 text-sm">{errors.visibility.message}</p>}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status*
            </label>
            <select
              id="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-realty-primary focus:ring-realty-primary"
              {...register("status")}
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="canceled">Canceled</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(isAdmin ? "/admin/contests" : "/user/contests")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-realty-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-realty-primary hover:bg-realty-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-realty-primary disabled:opacity-50 flex items-center"
          >
            {submitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
            {submitting ? "Updating..." : "Update Contest"}
          </button>
        </div>
      </form>
    </div>
  )
}
