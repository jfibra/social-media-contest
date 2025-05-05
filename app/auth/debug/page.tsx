"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthDebugPage() {
  const { user, member, token, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get localStorage data
    if (typeof window !== "undefined") {
      const data: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          data[key] = localStorage.getItem(key) || ""
        }
      }
      setLocalStorageData(data)
    }
  }, [])

  const handleClearAuth = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_member")
    window.location.reload()
  }

  const handleRedirectAdmin = () => {
    router.push("/admin/dashboard")
  }

  const handleRedirectUser = () => {
    router.push("/user/dashboard")
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
              <div className="bg-gray-50 p-4 rounded-md">
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
                  <pre className="bg-gray-100 p-2 mt-1 rounded overflow-auto text-xs">
                    {user ? JSON.stringify(user, null, 2) : "null"}
                  </pre>
                </div>
                <div>
                  <span className="font-semibold">Member:</span>
                  <pre className="bg-gray-100 p-2 mt-1 rounded overflow-auto text-xs">
                    {member ? JSON.stringify(member, null, 2) : "null"}
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Local Storage Data</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                {Object.keys(localStorageData).map((key) => (
                  <div key={key} className="mb-4">
                    <div className="font-semibold">{key}:</div>
                    <pre className="bg-gray-100 p-2 mt-1 rounded overflow-auto text-xs">
                      {key.includes("auth") && localStorageData[key]
                        ? JSON.stringify(JSON.parse(localStorageData[key]), null, 2)
                        : localStorageData[key]}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleClearAuth}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Clear Auth Data
            </button>
            <button
              onClick={handleRedirectAdmin}
              className="px-4 py-2 bg-realty-primary text-white rounded-md hover:bg-realty-secondary transition-colors"
            >
              Go to Admin Dashboard
            </button>
            <button
              onClick={handleRedirectUser}
              className="px-4 py-2 bg-realty-secondary text-white rounded-md hover:bg-realty-primary transition-colors"
            >
              Go to User Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
