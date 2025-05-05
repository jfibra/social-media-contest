"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export default function AuthDebug() {
  const { user, member, token, isAuthenticated, isAdmin } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-md text-xs opacity-50 hover:opacity-100"
      >
        Debug Auth
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-lg rounded-md p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <button onClick={() => setShowDebug(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <div className="text-xs">
        <div className="mb-2">
          <span className="font-semibold">isAuthenticated:</span> {isAuthenticated ? "true" : "false"}
        </div>
        <div className="mb-2">
          <span className="font-semibold">isAdmin:</span> {isAdmin ? "true" : "false"}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Token:</span> {token ? `${token.substring(0, 20)}...` : "null"}
        </div>
        <div className="mb-2">
          <span className="font-semibold">User:</span>
          <pre className="bg-gray-100 p-1 mt-1 rounded overflow-auto">
            {user ? JSON.stringify(user, null, 2) : "null"}
          </pre>
        </div>
        <div>
          <span className="font-semibold">Member:</span>
          <pre className="bg-gray-100 p-1 mt-1 rounded overflow-auto">
            {member ? JSON.stringify(member, null, 2) : "null"}
          </pre>
        </div>
      </div>
    </div>
  )
}
