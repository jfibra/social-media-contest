import type { Metadata } from "next"
import { getActiveContest } from "@/lib/api"
import HeroSection from "./components/hero-section"
import DefaultHeroSection from "./components/default-hero-section"
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

  return (
    <>
      {activeContest ? <HeroSection contest={activeContest} /> : <DefaultHeroSection />}
      <CompanyLogos />
      <AboutSection />
      <CTASection />

      {/* JSON-LD structured data for SEO */}
      {activeContest && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              name: activeContest.name,
              description: activeContest.description,
              startDate: activeContest.startDate,
              endDate: activeContest.endDate,
              image: activeContest.posterUrl,
              url: `${SITE_URL}/contests/${activeContest.slug}`,
              organizer: {
                "@type": "Organization",
                name: "Leuterio Realty & Brokerage",
                url: "https://leuteriorealty.com",
              },
              location: {
                "@type": "VirtualLocation",
                url: `${SITE_URL}/contests/${activeContest.slug}`,
              },
              offers: {
                "@type": "Offer",
                availability: "https://schema.org/InStock",
                price: "0",
                priceCurrency: "PHP",
                validFrom: activeContest.startDate,
                url: `${SITE_URL}/contests/${activeContest.slug}`,
              },
            }),
          }}
        />
      )}
    </>
  )
}
