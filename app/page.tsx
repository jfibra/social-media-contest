import type { Metadata } from "next"
import { getActiveContest } from "@/lib/api"
import HeroSection from "./components/hero-section"
import CompanyLogos from "./components/company-logos"
import AboutSection from "./components/about-section"
import CTASection from "./components/cta-section"
import { SITE_URL } from "./env"

export const metadata: Metadata = {
  title: "Social Media Contests | Leuterio Realty & Brokerage",
  description:
    "Join exciting social media contests hosted by Leuterio Realty & Brokerage. Win prizes and engage with top real estate professionals in the Philippines.",
  openGraph: {
    title: "Social Media Contests | Leuterio Realty & Brokerage",
    description:
      "Join exciting social media contests hosted by Leuterio Realty & Brokerage. Win prizes and engage with top real estate professionals in the Philippines.",
    url: SITE_URL,
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

export default async function Home() {
  const activeContest = await getActiveContest()

  // Fallback contest in case API fails
  const fallbackContest = {
    id: 1,
    name: "Summer Promo Contest",
    description: "Join our summer promo and win prizes!",
    logoUrl: "/placeholder.svg?key=pggs7",
    posterUrl: "/images/contest-poster.png", // Use a more specific fallback image
    startDate: "2025-05-01 00:00:00",
    endDate: "2025-05-31 23:59:59",
    status: "upcoming" as const,
    slug: "summer-promo-contest",
  }

  const contest = activeContest || fallbackContest

  return (
    <>
      <HeroSection contest={contest} />
      <CompanyLogos />
      <AboutSection />
      <CTASection />

      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
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
            location: {
              "@type": "VirtualLocation",
              url: `${SITE_URL}/contests/${contest.slug}`,
            },
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/InStock",
              price: "0",
              priceCurrency: "PHP",
              validFrom: contest.startDate,
              url: `${SITE_URL}/contests/${contest.slug}`,
            },
          }),
        }}
      />
    </>
  )
}
