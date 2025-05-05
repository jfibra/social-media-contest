import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllContests, getActiveContest } from "@/lib/api"
import { SITE_URL } from "@/app/env"
import ContestClientPage from "./ContestClientPage"

interface ContestPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ContestPageProps): Promise<Metadata> {
  const contests = await getAllContests()
  const contest = contests.find((c) => c.slug === params.slug)

  if (!contest) {
    return {
      title: "Contest Not Found | Leuterio Realty & Brokerage",
      description: "The requested contest could not be found.",
    }
  }

  return {
    title: `${contest.name} | Leuterio Realty & Brokerage Contests`,
    description: contest.description,
    openGraph: {
      title: `${contest.name} | Leuterio Realty & Brokerage Contests`,
      description: contest.description,
      url: `${SITE_URL}/contests/${contest.slug}`,
      siteName: "Leuterio Realty & Brokerage Contests",
      images: [
        {
          url: contest.posterUrl || `${SITE_URL}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: contest.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
  }
}

export default async function ContestPage({ params }: ContestPageProps) {
  // Try to get all contests first
  const contests = await getAllContests()

  // Find the contest by slug (getAllContests already filters for public contests)
  let contest = contests.find((c) => c.slug === params.slug)

  // If not found and contests array is empty, try to get the active contest
  if (!contest && contests.length === 0) {
    const activeContest = await getActiveContest()
    if (activeContest && activeContest.slug === params.slug) {
      contest = activeContest
    }
  }

  // If still not found, use a fallback contest for development or redirect to 404
  if (!contest) {
    // In production, we would redirect to 404
    if (process.env.NODE_ENV === "production") {
      notFound()
    }

    // For development, use a fallback contest
    contest = {
      id: 999,
      name: params.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      description: "This is a fallback contest for development purposes.",
      logoUrl: "/placeholder.svg?key=fallback-logo",
      posterUrl: "/placeholder.svg?key=fallback-poster",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming" as const,
      visibility: "public" as const,
      slug: params.slug,
    }
  }

  return <ContestClientPage contest={contest} />
}
