"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Loader2, AlertCircle, Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NEXT_PUBLIC_API_BASE_URL_2 } from "@/app/env"

interface FileUploaderProps {
  onUploadComplete: (url: string) => void
  type: "logo" | "poster"
  fileName: string
}

// Rate limit keys for localStorage
const LOGO_UPLOAD_TIMESTAMP_KEY = "logo_upload_timestamp"
const POSTER_UPLOAD_TIMESTAMP_KEY = "poster_upload_timestamp"
const RATE_LIMIT_DURATION = 60 * 1000 // 1 minute in milliseconds

export function FileUploader({ onUploadComplete, type, fileName }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Check rate limit on component mount and set up timer if needed
  useEffect(() => {
    const storageKey = type === "logo" ? LOGO_UPLOAD_TIMESTAMP_KEY : POSTER_UPLOAD_TIMESTAMP_KEY
    const lastUploadTime = localStorage.getItem(storageKey)

    if (lastUploadTime) {
      const lastUpload = Number.parseInt(lastUploadTime, 10)
      const now = Date.now()
      const elapsed = now - lastUpload

      if (elapsed < RATE_LIMIT_DURATION) {
        const remaining = RATE_LIMIT_DURATION - elapsed
        setIsRateLimited(true)
        setTimeRemaining(Math.ceil(remaining / 1000))

        // Set up countdown timer
        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              setIsRateLimited(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      }
    }
  }, [type])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check rate limit before proceeding
    const storageKey = type === "logo" ? LOGO_UPLOAD_TIMESTAMP_KEY : POSTER_UPLOAD_TIMESTAMP_KEY
    const lastUploadTime = localStorage.getItem(storageKey)

    if (lastUploadTime) {
      const lastUpload = Number.parseInt(lastUploadTime, 10)
      const now = Date.now()
      const elapsed = now - lastUpload

      if (elapsed < RATE_LIMIT_DURATION) {
        const remaining = Math.ceil((RATE_LIMIT_DURATION - elapsed) / 1000)
        setIsRateLimited(true)
        setTimeRemaining(remaining)
        setError(`Please wait ${remaining} seconds before uploading again`)
        return
      }
    }

    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      // Ensure we have a valid filename to use
      let uploadFileName = fileName || "contest"

      // If fileName is empty or just whitespace, use a default name
      if (!uploadFileName.trim()) {
        uploadFileName = "contest_" + new Date().getTime()
      }

      // Add a timestamp to ensure uniqueness
      const timestamp = new Date().getTime()
      uploadFileName = `${uploadFileName}_${timestamp}`

      const formData = new FormData()
      formData.append("file", file)

      // Add the appropriate name field based on type
      if (type === "logo") {
        formData.append("logo", uploadFileName)
      } else {
        formData.append("poster_name", uploadFileName)
      }

      // Log what we're sending for debugging
      console.log(`Uploading ${type} with name: ${uploadFileName}`)

      // Ensure we're using HTTPS for the API endpoint
      let apiBaseUrl = NEXT_PUBLIC_API_BASE_URL_2

      // Force HTTPS if not already using it
      if (apiBaseUrl.startsWith("http:")) {
        apiBaseUrl = apiBaseUrl.replace("http:", "https:")
      }

      // Determine the endpoint based on type
      const endpoint = type === "logo" ? `${apiBaseUrl}/upload-developer-logo` : `${apiBaseUrl}/upload-poster-photos`

      console.log(`Uploading to endpoint: ${endpoint}`)

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Upload response:", data)

      if (data.data && data.data.url) {
        // Ensure the returned URL is also HTTPS
        let secureUrl = data.data.url
        if (secureUrl.startsWith("http:")) {
          secureUrl = secureUrl.replace("http:", "https:")
        }

        // Check if the URL ends with /.png or similar pattern indicating missing filename
        if (secureUrl.match(/\/\.[a-zA-Z0-9]+$/)) {
          throw new Error("Server returned an invalid URL (missing filename)")
        }

        onUploadComplete(secureUrl)
        setSuccess(true)

        // Store upload timestamp for rate limiting
        localStorage.setItem(storageKey, Date.now().toString())
      } else if (data.url) {
        // Handle alternative response format
        let secureUrl = data.url
        if (secureUrl.startsWith("http:")) {
          secureUrl = secureUrl.replace("http:", "https:")
        }

        // Check if the URL ends with /.png or similar pattern indicating missing filename
        if (secureUrl.match(/\/\.[a-zA-Z0-9]+$/)) {
          throw new Error("Server returned an invalid URL (missing filename)")
        }

        onUploadComplete(secureUrl)
        setSuccess(true)

        // Store upload timestamp for rate limiting
        localStorage.setItem(storageKey, Date.now().toString())
      } else {
        throw new Error("No URL returned from server")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        id={`file-upload-${type}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept="image/*"
        disabled={isUploading || isRateLimited}
      />
      <Button
        type="button"
        variant="outline"
        className={`flex items-center gap-2 ${isUploading || isRateLimited ? "opacity-70" : ""}`}
        disabled={isUploading || isRateLimited}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRateLimited ? (
          <Clock className="h-4 w-4 text-amber-500" />
        ) : success ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isRateLimited ? `Wait ${timeRemaining}s` : `Upload ${type === "logo" ? "Logo" : "Poster"}`}
      </Button>
      {error && (
        <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
      {isRateLimited && !error && (
        <div className="text-xs text-amber-500 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Please wait {timeRemaining} seconds before uploading again
        </div>
      )}
    </div>
  )
}
