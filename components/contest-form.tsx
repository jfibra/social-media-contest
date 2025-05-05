"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/app/env"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, Loader2 } from "lucide-react"

interface ContestFormProps {
  isAdmin?: boolean
}

export default function ContestForm({ isAdmin = false }: ContestFormProps) {
  const { user, member, token } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    contest_name: "",
    slug: "",
    description: "",
    contest_rules: "",
    prizes: "",
    logo_url: "",
    poster_url: "",
    start_time: "",
    end_time: "",
    entry_deadline: "",
    max_entries_per_user: "1",
    visibility: "public",
    status: "upcoming",
  })

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // If name is contest_name, also generate a slug
    if (name === "contest_name") {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")

      setFormData({
        ...formData,
        [name]: value,
        slug: slug,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare the data
      const contestData = {
        ...formData,
        memberid: member?.id || user?.id,
        created_by: user?.id,
      }

      // Send the request to create a contest
      const response = await fetch(`${API_BASE_URL}/scm/contests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(contestData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create contest: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSuccess("Contest created successfully!")

      // Reset form
      setFormData({
        contest_name: "",
        slug: "",
        description: "",
        contest_rules: "",
        prizes: "",
        logo_url: "",
        poster_url: "",
        start_time: "",
        end_time: "",
        entry_deadline: "",
        max_entries_per_user: "1",
        visibility: "public",
        status: "upcoming",
      })

      // Redirect after a short delay
      setTimeout(() => {
        if (isAdmin) {
          router.push("/admin/contests")
        } else {
          router.push("/user/contests")
        }
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error creating contest:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Contest</h2>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contest_name" className="block text-sm font-medium text-realty-text mb-2">
              Contest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contest_name"
              name="contest_name"
              value={formData.contest_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-realty-text mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              required
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly name (auto-generated from contest name)</p>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-realty-text mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contest_rules" className="block text-sm font-medium text-realty-text mb-2">
              Contest Rules
            </label>
            <textarea
              id="contest_rules"
              name="contest_rules"
              value={formData.contest_rules}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            ></textarea>
          </div>

          <div>
            <label htmlFor="prizes" className="block text-sm font-medium text-realty-text mb-2">
              Prizes
            </label>
            <textarea
              id="prizes"
              name="prizes"
              value={formData.prizes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-realty-text mb-2">
              Logo URL
            </label>
            <input
              type="url"
              id="logo_url"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label htmlFor="poster_url" className="block text-sm font-medium text-realty-text mb-2">
              Poster URL
            </label>
            <input
              type="url"
              id="poster_url"
              name="poster_url"
              value={formData.poster_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              placeholder="https://example.com/poster.png"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium text-realty-text mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="end_time" className="block text-sm font-medium text-realty-text mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="entry_deadline" className="block text-sm font-medium text-realty-text mb-2">
              Entry Deadline
            </label>
            <input
              type="datetime-local"
              id="entry_deadline"
              name="entry_deadline"
              value={formData.entry_deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="max_entries_per_user" className="block text-sm font-medium text-realty-text mb-2">
              Max Entries Per User
            </label>
            <input
              type="number"
              id="max_entries_per_user"
              name="max_entries_per_user"
              value={formData.max_entries_per_user}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            />
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-realty-text mb-2">
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-realty-text mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-realty-primary hover:bg-realty-secondary text-white px-6 py-3 rounded-md font-medium transition-colors duration-300 disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              "Create Contest"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
