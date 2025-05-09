"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { API_BASE_URL } from "@/app/env"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Award, Users, TrendingUp, Activity } from "lucide-react"

export default function AnalyticsPage() {
  const { member } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState({
    totalContests: 0,
    activeContests: 0,
    totalSubmissions: 0,
    approvedSubmissions: 0,
    totalUsers: 0,
    activeUsers: 0,
    contestsByMonth: [] as any[],
    submissionsByStatus: [] as any[],
    topContests: [] as any[],
    usersByRole: [] as any[],
  })
  const [timeRange, setTimeRange] = useState("all")

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true)

        // Fetch all contests with submissions
        const contestsResponse = await fetch(`${API_BASE_URL}/scm/contests/all-with-submissions`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!contestsResponse.ok) {
          throw new Error("Failed to fetch contests data")
        }

        const contestsData = await contestsResponse.json()

        // Fetch all users
        const usersResponse = await fetch(`${API_BASE_URL}/scm/access`, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users data")
        }

        const usersData = await usersResponse.json()

        // Process data for analytics
        const now = new Date()
        const contests = contestsData["0"] || []
        const users = usersData || []

        // Calculate basic metrics
        const activeContests = contests.filter(
          (contest: any) => contest.status === "active" && contest.is_deleted === 0,
        ).length

        let allSubmissions: any[] = []
        contests.forEach((contest: any) => {
          if (contest.submissions && Array.isArray(contest.submissions)) {
            allSubmissions = [...allSubmissions, ...contest.submissions]
          }
        })

        const approvedSubmissions = allSubmissions.filter((sub) => sub.status === "approved").length
        const activeUsers = users.filter((user: any) => user.status === "active").length

        // Process contests by month
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const contestsByMonth = Array(12)
          .fill(0)
          .map((_, i) => ({
            name: monthNames[i],
            contests: 0,
            submissions: 0,
          }))

        contests.forEach((contest: any) => {
          const createdAt = new Date(contest.created_at)
          const monthIndex = createdAt.getMonth()
          contestsByMonth[monthIndex].contests++

          if (contest.submissions && Array.isArray(contest.submissions)) {
            contestsByMonth[monthIndex].submissions += contest.submissions.length
          }
        })

        // Process submissions by status
        const submissionsByStatus = [
          { name: "Pending", value: allSubmissions.filter((sub) => sub.status === "pending").length },
          { name: "Approved", value: allSubmissions.filter((sub) => sub.status === "approved").length },
          { name: "Rejected", value: allSubmissions.filter((sub) => sub.status === "rejected").length },
        ]

        // Process top contests by submissions
        const topContests = contests
          .map((contest: any) => ({
            name: contest.contest_name,
            submissions: contest.submissions ? contest.submissions.length : 0,
          }))
          .sort((a: any, b: any) => b.submissions - a.submissions)
          .slice(0, 5)

        // Process users by role
        const usersByRole = [
          { name: "Agent", value: users.filter((user: any) => user.role === "agent").length },
          { name: "Team Leader", value: users.filter((user: any) => user.role === "team leader").length },
          { name: "Unit Manager", value: users.filter((user: any) => user.role === "unit manager").length },
          { name: "Admin", value: users.filter((user: any) => user.role === "admin").length },
        ]

        setAnalytics({
          totalContests: contests.length,
          activeContests,
          totalSubmissions: allSubmissions.length,
          approvedSubmissions,
          totalUsers: users.length,
          activeUsers,
          contestsByMonth,
          submissionsByStatus,
          topContests,
          usersByRole,
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data. Please try again later.")
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-realty-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading analytics data...</p>
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
              onClick={() => window.location.reload()}
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="flex items-center">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Contests</CardTitle>
              <Calendar className="h-4 w-4 text-realty-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalContests}</div>
              <p className="text-xs text-muted-foreground">{analytics.activeContests} active contests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Award className="h-4 w-4 text-realty-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">{analytics.approvedSubmissions} approved submissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-realty-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{analytics.activeUsers} active users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-realty-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.totalSubmissions > 0
                  ? Math.round((analytics.approvedSubmissions / analytics.totalSubmissions) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.approvedSubmissions} of {analytics.totalSubmissions} submissions
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contests" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="contests">Contests</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="contests">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contests by Month</CardTitle>
                  <CardDescription>Number of contests created each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.contestsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="contests" fill="#8884d8" name="Contests" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Contests</CardTitle>
                  <CardDescription>Contests with most submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={analytics.topContests}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="submissions" fill="#82ca9d" name="Submissions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submissions by Status</CardTitle>
                  <CardDescription>Distribution of submission statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.submissionsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.submissionsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submissions by Month</CardTitle>
                  <CardDescription>Number of submissions received each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.contestsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="submissions" fill="#82ca9d" name="Submissions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                  <CardDescription>Distribution of user roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.usersByRole}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.usersByRole.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>User engagement over time</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-80">
                  <div className="text-center">
                    <Activity className="h-16 w-16 text-realty-primary mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500">Detailed user activity tracking coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
