"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NEXT_PUBLIC_API_BASE_URL_2 } from "@/app/env"

interface FileUploaderProps {
  onUploadComplete: (url: string) => void
  type: "logo" | "poster"
  fileName: string
}

export function FileUploader({ onUploadComplete, type, fileName }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Add the appropriate name field based on type
      if (type === "logo") {
        formData.append("logo", `${fileName}_logo`)
      } else {
        formData.append("poster_name", `${fileName}_poster`)
      }

      // Determine the endpoint based on type
      const endpoint =
        type === "logo"
          ? `${NEXT_PUBLIC_API_BASE_URL_2}/upload-developer-logo`
          : `${NEXT_PUBLIC_API_BASE_URL_2}/upload-poster-photos`

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.url) {
        onUploadComplete(data.url)
        setSuccess(true)
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
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        className={`flex items-center gap-2 ${isUploading ? "opacity-70" : ""}`}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : success ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Upload {type === "logo" ? "Logo" : "Poster"}
      </Button>
      {error && (
        <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}
