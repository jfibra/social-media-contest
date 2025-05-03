import type { Metadata } from "next"
import { getAllContests } from "@/lib/api"
import ContestCard from "../components/contest-card"
import { SITE_URL } from "../env"

export const metadata: Metadata = {
  title: "All Contests | Leuterio Realty & Brokerage",
  description:
    "Browse all current and past social media contests hosted by Leuterio Realty & Brokerage. Find exciting opportunities to engage and win prizes.",
  openGraph: {
    title: "All Contests | Leuterio Realty & Brokerage",
    description:
      "Browse all current and past social media contests hosted by Leuterio Realty & Brokerage. Find exciting opportunities to engage and win prizes.",
    url: `${SITE_URL}/contests`,
    siteName: "Leuterio Realty & Brokerage Contests",
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Leuterio Realty & Brokerage Social Media Contests",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default async function ContestsPage() {
  const contests = await getAllContests()
  console.log("Fetched contests:", contests) // Debug log

  // Fallback contests in case API fails
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
      status: "completed" as const,
      slug: "real-estate-quiz",
    },
  ]

  // Use fallback contests if API returns empty array
  const displayContests = contests && contests.length > 0 ? contests : fallbackContests

  // Find active contests
  const activeContests = displayContests.filter((contest) => contest.status === "active")
  const completedContests = displayContests.filter((contest) => contest.status === "completed")
  const upcomingContests = displayContests.filter((contest) => contest.status === "upcoming")

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 opacity-0 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Social Media Contests</h1>
          <p className="text-lg text-realty-text">
            Browse all current and past contests hosted by Leuterio Realty & Brokerage. Engage with our community and
            win exciting prizes!
          </p>
        </div>

        {activeContests.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 opacity-0 animate-fadeIn">Active Contests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeContests.map((contest, index) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  featured={index === 0}
                  className={`opacity-0 animate-fadeIn animate-delay-${index * 100}`}
                />
              ))}
            </div>
          </div>
        )}

        {upcomingContests.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 opacity-0 animate-fadeIn">Upcoming Contests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingContests.map((contest, index) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  className={`opacity-0 animate-fadeIn animate-delay-${index * 100}`}
                />
              ))}
            </div>
          </div>
        )}

        {completedContests.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 opacity-0 animate-fadeIn">Past Contests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedContests.map((contest, index) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  className={`opacity-0 animate-fadeIn animate-delay-${index * 100}`}
                />
              ))}
            </div>
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
            itemListElement: displayContests.map((contest, index) => ({
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
