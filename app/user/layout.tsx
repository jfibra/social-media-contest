"use client"

import type React from "react"
import UserProtectedRoute from "@/components/user-protected-route"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UserProtectedRoute>{children}</UserProtectedRoute>
}
