import { SITE_URL } from "@/app/env"
import type { Metadata } from "next"

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
