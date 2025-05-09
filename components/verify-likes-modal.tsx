"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThumbsUp } from "lucide-react"
import type { Submission } from "@/types/submission"

interface VerifyLikesModalProps {
  isOpen: boolean
  onClose: () => void
  submission: Submission
  onSubmit: (data: { likes: number; screenshot_url?: string }) => void
}

export function VerifyLikesModal({ isOpen, onClose, submission, onSubmit }: VerifyLikesModalProps) {
  const [likes, setLikes] = useState(
    submission.verified_likes || submission.likes_verification_json?.likes || submission.initial_likes,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        likes,
        // We're keeping the screenshot_url in the API for backward compatibility
        // but not requiring users to provide it anymore
        screenshot_url: submission.likes_verification_json?.screenshot_url || "",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Likes</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="likes" className="text-right">
                Verified Likes
              </Label>
              <div className="col-span-3 flex items-center">
                <ThumbsUp className="h-4 w-4 mr-2 text-blue-500" />
                <Input
                  id="likes"
                  type="number"
                  value={likes}
                  onChange={(e) => setLikes(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify Likes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
