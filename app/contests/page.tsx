"use client"

import { useState, useEffect } from "react"
import { Filter } from "lucide-react"
import ContestCard from "../components/contest-card"
import { SITE_URL } from "../env"
import type { Contest } from "@/types/contest"

// This would normally be fetched server-side, but we're making it client-side for the filters
export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredContests, setFilteredContests] = useState<Contest[]>([])

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [startDateFilter, setStartDateFilter] = useState<string>("")
  const [endDateFilter, setEndDateFilter] = useState<string>("")

  useEffect(() => {
    async function fetchContests() {
      try {
        const response = await fetch(`/api/contests`)
        if (!response.ok) {
          throw new Error("Failed to fetch contests")
        }
        const data = await response.json()
        setContests(data)
        setFilteredContests(data)
      } catch (error) {
        console.error("Error fetching contests:", error)
        // Use fallback contests
        const fallbackContests = [
          {
            id: 1,
            name: "Summer Promo Contest",
            description: "Join our summer promo and win prizes!",
            logoUrl: "/placeholder.svg?key=k3sr2",
            posterUrl: "/placeholder.svg?key=oehvy",
            startDate: "2025-05-01 00:00:00",
            endDate: "2025-05-31 23:59:59",
            status: "upcoming" as const,
            visibility: "public" as const,
            slug: "summer-promo-contest",
          },
          {
            id: 2,
            name: "Rainy Season Challenge",
            description: "Share your rainy season adventures!",
            logoUrl: "/placeholder.svg?key=xxard",
            posterUrl: "/placeholder.svg?key=on8u6",
            startDate: "2025-05-01 00:00:00",
            endDate: "2025-05-31 23:59:59",
            status: "upcoming" as const,
            visibility: "public" as const,
            slug: "rainy-season-challenge",
          },
          {
            id: 3,
            name: "Real Estate Quiz Competition",
            description: "Test your knowledge about real estate and win exciting prizes.",
            logoUrl: "/placeholder.svg?key=162nt",
            posterUrl: "/placeholder.svg?key=f8omv",
            startDate: "2025-04-01 00:00:00",
            endDate: "2025-04-30 23:59:59",
            status: "ended" as const,
            visibility: "public" as const,
            slug: "real-estate-quiz",
          },
        ]
        setContests(fallbackContests)
        setFilteredContests(fallbackContests)
      } finally {
        setLoading(false)
      }
    }

    fetchContests()
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = [...contests]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((contest) => contest.status === statusFilter)
    }

    // Apply date filters
    if (startDateFilter) {
      filtered = filtered.filter((contest) => new Date(contest.startDate) >= new Date(startDateFilter))
    }

    if (endDateFilter) {
      filtered = filtered.filter((contest) => new Date(contest.endDate) <= new Date(endDateFilter))
    }

    setFilteredContests(filtered)
  }, [contests, statusFilter, startDateFilter, endDateFilter])

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 opacity-0 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Social Media Contests</h1>
          <p className="text-lg text-realty-text">
            Browse all contests hosted by Leuterio Realty & Brokerage. Engage with our community and win exciting
            prizes!
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 opacity-0 animate-fadeIn">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-realty-primary mr-2" />
            <h2 className="text-xl font-bold">Filter Contests</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-realty-text mb-2">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div>
              <label htmlFor="start-date-filter" className="block text-sm font-medium text-realty-text mb-2">
                Start Date (From)
              </label>
              <input
                type="date"
                id="start-date-filter"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              />
            </div>

            <div>
              <label htmlFor="end-date-filter" className="block text-sm font-medium text-realty-text mb-2">
                End Date (To)
              </label>
              <input
                type="date"
                id="end-date-filter"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-realty-primary"></div>
          </div>
        ) : filteredContests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredContests.map((contest, index) => (
              <ContestCard
                key={contest.id}
                contest={contest}
                className={`opacity-0 animate-fadeIn animate-delay-${(index % 5) * 100}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">No Contests Found</h2>
            <p className="text-realty-text">
              No contests match your current filter criteria. Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>

      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: filteredContests.map((contest, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Event",
                name: contest.name,
                description: contest.description,
                startDate: contest.startDate,
                endDate: contest.endDate,
                image: contest.posterUrl,
                url: `${SITE_URL}/contests/${contest.slug}`,
                organizer: {
                  "@type": "Organization",
                  name: "Leuterio Realty & Brokerage",
                  url: "https://leuteriorealty.com",
                },
              },
            })),
          }),
        }}
      />
    </div>
  )
}
