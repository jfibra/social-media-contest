"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface FileInputProps {
  value: File | null
  onChange: (file: File | null) => void
  accept?: string
  previewType?: "image" | "none"
  buttonText?: string
  placeholder?: string
  className?: string
}

export function FileInput({
  value,
  onChange,
  accept = "*",
  previewType = "none",
  buttonText = "Upload File",
  placeholder = "Drag and drop a file here, or click to browse",
  className = "",
}: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Create preview URL when file changes
  React.useEffect(() => {
    if (value && previewType === "image") {
      const url = URL.createObjectURL(value)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [value, previewType])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (accept === "*" || file.type.match(accept.replace("*", ".*"))) {
        onChange(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />

      {value ? (
        <div className="border-2 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{value.name}</span>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {previewType === "image" && previewUrl && (
            <div className="mt-2 flex justify-center">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="max-h-40 max-w-full object-contain rounded"
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">{placeholder}</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={handleButtonClick}>
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  )
}
