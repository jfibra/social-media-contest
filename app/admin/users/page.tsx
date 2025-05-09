"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { API_BASE_URL } from "@/app/env"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Edit, Filter, Download } from "lucide-react"
import { showSuccess, showError } from "@/lib/swal"

interface User {
  id: number
  email: string
  full_name: string
  memberid: string
  team?: string
  subteam?: string
  role: string
  status: string
  created_at: string
  updated_at: string
  contests_count?: number
}

export default function UsersManagementPage() {
  const { member } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [userContests, setUserContests] = useState<any[]>([])
  const [userContestsLoading, setUserContestsLoading] = useState(false)

  // Form state for editing user
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    memberid: "",
    team: "",
    subteam: "",
    role: "",
    status: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, statusFilter, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/scm/access`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()

      // Fetch contest counts for each user
      const usersWithContestCounts = await Promise.all(
        data.map(async (user: User) => {
          try {
            const contestsResponse = await fetch(`${API_BASE_URL}/scm/contests/user/${user.memberid}`, {
              headers: {
                "Content-Type": "application/json",
              },
            })

            if (contestsResponse.ok) {
              const contestsData = await contestsResponse.json()
              const contests = contestsData["0"] || []
              return {
                ...user,
                contests_count: contests.length,
              }
            }

            return {
              ...user,
              contests_count: 0,
            }
          } catch (err) {
            console.error(`Error fetching contests for user ${user.id}:`, err)
            return {
              ...user,
              contests_count: 0,
            }
          }
        }),
      )

      setUsers(usersWithContestCounts)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again later.")
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.memberid.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      memberid: user.memberid,
      team: user.team || "",
      subteam: user.subteam || "",
      role: user.role,
      status: user.status,
    })
    setIsEditDialogOpen(true)
    fetchUserContests(user.memberid)
  }

  const fetchUserContests = async (memberid: string) => {
    try {
      setUserContestsLoading(true)
      const response = await fetch(`${API_BASE_URL}/scm/contests/user/${memberid}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user contests")
      }

      const data = await response.json()
      setUserContests(data["0"] || [])
      setUserContestsLoading(false)
    } catch (err) {
      console.error("Error fetching user contests:", err)
      setUserContests([])
      setUserContestsLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`${API_BASE_URL}/scm/access/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      const updatedUser = await response.json()

      // Update the users list with the updated user
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...updatedUser, contests_count: user.contests_count } : user,
        ),
      )

      setIsEditDialogOpen(false)
      showSuccess("User updated successfully")
    } catch (err) {
      console.error("Error updating user:", err)
      showError("Failed to update user. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const exportToCsv = () => {
    const headers = ["ID", "Name", "Email", "Member ID", "Team", "Subteam", "Role", "Status", "Contests Created"]

    const csvRows = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [
          user.id,
          `"${user.full_name.replace(/"/g, '""')}"`,
          `"${user.email.replace(/"/g, '""')}"`,
          `"${user.memberid.replace(/"/g, '""')}"`,
          `"${user.team ? user.team.replace(/"/g, '""') : ""}"`,
          `"${user.subteam ? user.subteam.replace(/"/g, '""') : ""}"`,
          `"${user.role.replace(/"/g, '""')}"`,
          `"${user.status.replace(/"/g, '""')}"`,
          user.contests_count || 0,
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    const now = new Date()
    const formattedDate = now.toISOString().split("T")[0]

    link.setAttribute("href", url)
    link.setAttribute("download", `users_export_${formattedDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-realty-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 bg-realty-primary text-white rounded-md hover:bg-realty-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Manage Users</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="team leader">Team Leader</SelectItem>
                  <SelectItem value="unit manager">Unit Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={exportToCsv}>
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export CSV</span>
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contests</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.memberid}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${user.role === "admin" ? "bg-purple-100 text-purple-800 border-purple-200" : ""}
                            ${user.role === "unit manager" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                            ${user.role === "team leader" ? "bg-green-100 text-green-800 border-green-200" : ""}
                            ${user.role === "agent" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
                          `}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${user.status === "active" ? "bg-green-100 text-green-800 border-green-200" : ""}
                            ${user.status === "inactive" ? "bg-red-100 text-red-800 border-red-200" : ""}
                          `}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.contests_count || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="h-8 w-8 p-0">
                          <span className="sr-only">Edit</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information, status, and role.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="memberid" className="text-sm font-medium">
                    Member ID
                  </label>
                  <Input id="memberid" name="memberid" value={formData.memberid} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="team" className="text-sm font-medium">
                    Team
                  </label>
                  <Input id="team" name="team" value={formData.team} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="subteam" className="text-sm font-medium">
                    Subteam
                  </label>
                  <Input id="subteam" name="subteam" value={formData.subteam} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="team leader">Team Leader</SelectItem>
                      <SelectItem value="unit manager">Unit Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">User Activity</h3>
                <div className="bg-gray-50 rounded-md p-4">
                  {userContestsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-realty-primary mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading contests...</p>
                    </div>
                  ) : userContests.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Total Contests Created:</span> {userContests.length}
                      </p>
                      <div className="max-h-40 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Contest Name</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Submissions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {userContests.map((contest) => (
                              <TableRow key={contest.id}>
                                <TableCell className="font-medium">{contest.contest_name}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${contest.status === "active" ? "bg-green-100 text-green-800 border-green-200" : ""}
                                      ${contest.status === "upcoming" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                                      ${contest.status === "completed" ? "bg-gray-100 text-gray-800 border-gray-200" : ""}
                                    `}
                                  >
                                    {contest.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{contest.submissions ? contest.submissions.length : 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No contests created by this user</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
