"use client"

import { useAuth } from "@/contexts/auth-context"
import { LogOut, User } from "lucide-react"

export default function AdminDashboard() {
  const { user, member, logout } = useAuth()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <button
              onClick={() => logout()}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-realty-primary mr-2" />
              <h2 className="text-xl font-bold">User Profile</h2>
            </div>

            {user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                {member && member.role && (
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium">{member.role}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-realty-primary bg-opacity-10 p-4 rounded-md">
            <h2 className="text-lg font-bold mb-2">Welcome to the Admin Dashboard</h2>
            <p>
              This is a protected area of the application. You can manage contests, view submissions, and more from
              here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
