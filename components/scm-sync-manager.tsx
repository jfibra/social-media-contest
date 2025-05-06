"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { syncScmAccessRecords } from "@/lib/scm-sync"

/**
 * Component that runs SCM access sync in the background
 * This can be added to the layout or dashboard pages
 */
export default function ScmSyncManager() {
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    // Only run sync if user is authenticated
    if (!isAuthenticated || !user) return

    // Run sync on initial load
    const runSync = async () => {
      try {
        console.log("Running background SCM access sync")
        const result = await syncScmAccessRecords()
        console.log("SCM sync result:", result)
      } catch (error) {
        console.error("Error running SCM sync:", error)
      }
    }

    runSync()

    // Set up periodic sync every 24 hours
    const syncInterval = setInterval(runSync, 24 * 60 * 60 * 1000)

    return () => {
      clearInterval(syncInterval)
    }
  }, [isAuthenticated, user])

  // This component doesn't render anything
  return null
}
