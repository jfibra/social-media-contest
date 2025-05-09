"use client"

import { useAuth } from "@/contexts/auth-context"
import { LogOut, User, Users, Calendar, BarChart2, Plus } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { user, member, logout } = useAuth()

  const adminMenuItems = [
    { icon: Calendar, label: "Manage Contests", href: "/admin/contests", description: "View and manage all contests" },
    {
      icon: Plus,
      label: "Create Contest",
      href: "/admin/contests/create",
      description: "Create a new social media contest",
    },
    { icon: BarChart2, label: "Analytics", href: "/admin/analytics", description: "View contest performance metrics" },
    { icon: Users, label: "Manage Users", href: "/admin/users", description: "Manage user accounts and permissions" },
  ]

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
              <h2 className="text-xl font-bold">Admin Profile</h2>
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
                {member && member.membertype && (
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{member.membertype}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminMenuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
              >
                <div className="bg-realty-primary bg-opacity-10 p-4 rounded-full mb-4">
                  <item.icon className="h-8 w-8 text-realty-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
