"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { isAdmin as checkIsAdmin } from "@/lib/auth"
import { showErrorAlert } from "@/lib/swal"

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login")
        router.push("/auth/login")
      } else if (!isAdmin) {
        // Double-check admin status using the direct function
        const directAdminCheck = checkIsAdmin()
        console.log("Admin status check:", { contextIsAdmin: isAdmin, directCheck: directAdminCheck })

        if (directAdminCheck) {
          // If direct check says user is admin but context doesn't, we'll allow access
          // This is a fallback in case the context state is out of sync
          console.log("Direct admin check passed, allowing access despite context")
          setVerified(true)
        } else {
          console.log("Not admin, redirecting to user dashboard")
          showErrorAlert("You don't have permission to access the admin area")
          router.push("/user/dashboard")
        }
      } else {
        setVerified(true)
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-realty-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || (!isAdmin && !verified)) {
    return null // Will redirect in the useEffect
  }

  return <>{children}</>
}
