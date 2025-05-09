import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllContests, getActiveContest, getContestBySlug } from "@/lib/api"
import { SITE_URL } from "@/app/env"
import ContestClientPage from "./ContestClientPage"

// Disable caching for this page
export const dynamic = "force-dynamic"
export const revalidate = 0

interface ContestPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ContestPageProps): Promise<Metadata> {
  console.log(`Generating metadata for contest with slug: ${params.slug}`)

  // Try to get the contest directly by slug first
  const contest = await getContestBySlug(params.slug)

  if (!contest) {
    console.log(`Contest not found for slug: ${params.slug}`)
    return {
      title: "Contest Not Found | Leuterio Realty & Brokerage",
      description: "The requested contest could not be found.",
    }
  }

  console.log(`Found contest for metadata: ${contest.name} (visibility: ${contest.visibility})`)

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
  console.log(`Rendering contest page for slug: ${params.slug}`)

  // Try to get the contest directly by slug first (including private contests)
  let contest = await getContestBySlug(params.slug)

  if (contest) {
    console.log(`Found contest directly by slug: ${contest.name} (visibility: ${contest.visibility})`)
  } else {
    console.log(`Contest not found by slug, trying alternative methods`)

    // If not found, try to get all contests (including private ones)
    const contests = await getAllContests(true)
    contest = contests.find((c) => c.slug === params.slug)

    if (contest) {
      console.log(`Found contest in all contests: ${contest.name} (visibility: ${contest.visibility})`)
    } else {
      console.log(`Contest not found in all contests, trying active contest`)

      // If still not found, try to get the active contest
      const activeContest = await getActiveContest(true)
      if (activeContest && activeContest.slug === params.slug) {
        contest = activeContest
        console.log(`Found contest as active contest: ${contest.name} (visibility: ${contest.visibility})`)
      } else {
        console.log(`Contest not found as active contest either`)
      }
    }
  }

  // If still not found, use a fallback contest for development or redirect to 404
  if (!contest) {
    console.log(`Contest not found, using fallback or 404`)

    // In production, we would redirect to 404
    if (process.env.NODE_ENV === "production") {
      console.log(`Production environment, redirecting to 404`)
      notFound()
    }

    // For development, use a fallback contest
    console.log(`Development environment, using fallback contest`)
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

  console.log(`Rendering contest client page for: ${contest.name} (visibility: ${contest.visibility})`)
  return <ContestClientPage contest={contest} />
}
