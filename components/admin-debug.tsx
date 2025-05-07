"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { isAdmin } from "@/lib/auth"

export default function AdminDebug() {
  const { user, member, isAdmin: contextIsAdmin } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  // Get the direct result from isAdmin function
  const directIsAdmin = isAdmin()

  // Get stored data
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null
  const storedMember = typeof window !== "undefined" ? localStorage.getItem("auth_member") : null
  const storedScmAccess = typeof window !== "undefined" ? localStorage.getItem("scm_access") : null

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-200 text-gray-700 p-2 rounded-md text-xs z-50"
      >
        Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-lg p-4 rounded-md max-w-md max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Admin Status Debug</h3>
        <button onClick={() => setShowDebug(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="text-xs space-y-2">
        <div>
          <p className="font-semibold">Auth Context State:</p>
          <p>isAdmin from context: {contextIsAdmin ? "true" : "false"}</p>
          <p>isAdmin direct check: {directIsAdmin ? "true" : "false"}</p>
        </div>

        <div>
          <p className="font-semibold">User Object:</p>
          <pre className="bg-gray-100 p-1 rounded overflow-auto">{JSON.stringify(user, null, 2)}</pre>
        </div>

        <div>
          <p className="font-semibold">Member Object:</p>
          <pre className="bg-gray-100 p-1 rounded overflow-auto">{JSON.stringify(member, null, 2)}</pre>
        </div>

        <div>
          <p className="font-semibold">localStorage Data:</p>
          <p>auth_user: {storedUser ? "exists" : "missing"}</p>
          <p>auth_member: {storedMember ? "exists" : "missing"}</p>
          <p>scm_access: {storedScmAccess ? "exists" : "missing"}</p>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              console.log("User:", JSON.parse(localStorage.getItem("auth_user") || "{}"))
              console.log("Member:", JSON.parse(localStorage.getItem("auth_member") || "{}"))
              console.log("SCM Access:", JSON.parse(localStorage.getItem("scm_access") || "{}"))
            }
          }}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Log Details to Console
        </button>
      </div>
    </div>
  )
}
