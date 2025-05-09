import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getContestBySlug } from "@/lib/api"
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

  // Try to get the contest by slug (includes private contests)
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

  // Try to get the contest by slug (includes private contests)
  const contest = await getContestBySlug(params.slug)

  // If not found, show 404
  if (!contest) {
    console.log(`Contest not found, redirecting to 404`)
    notFound()
  }

  console.log(`Rendering contest client page for: ${contest.name} (visibility: ${contest.visibility})`)
  return <ContestClientPage contest={contest} />
}
