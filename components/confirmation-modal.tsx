"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  contestId?: number
  isAdmin?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  contestId,
  isAdmin = false,
}: ConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { token, user } = useAuth()
  const [scmAccessId, setScmAccessId] = useState<string | null>(null)

  // Fetch the SCM access ID for the current user
  useEffect(() => {
    const fetchScmAccessId = async () => {
      if (!user?.email) return

      try {
        const normalizedEmail = user.email.toLowerCase().trim()
        const response = await fetch(`/api/scm/access/find-by-email/${encodeURIComponent(normalizedEmail)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        })

        if (response.ok) {
          const data = await response.json()
          if (data && data.data && data.data.id) {
            console.log(`Found SCM access ID for ${normalizedEmail}: ${data.data.id}`)
            setScmAccessId(data.data.id.toString())
          } else {
            console.error("SCM access ID not found in response:", data)
          }
        } else {
          console.error(`Failed to fetch SCM access ID for ${normalizedEmail}: ${response.status}`)
        }
      } catch (error) {
        console.error("Error fetching SCM access ID:", error)
      }
    }

    if (isOpen && user?.email) {
      fetchScmAccessId()
    }
  }, [isOpen, user?.email])

  const handleDelete = async () => {
    if (!contestId) {
      onConfirm()
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch("/api/contests/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          contestId,
          scmAccessId, // Include the SCM access ID
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete contest")
      }

      // Close the modal
      onClose()

      // Redirect to the contests page
      setTimeout(() => {
        if (isAdmin) {
          router.push("/admin/contests")
        } else {
          router.push("/user/contests")
        }
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Error deleting contest:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isDeleting}
            >
              {cancelText}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              disabled={isDeleting || (contestId && !scmAccessId)}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
