import type React from "react"
import type { Metadata } from "next"
import { SITE_URL } from "@/app/env"

export const metadata: Metadata = {
  title: "Authentication | Leuterio Realty & Brokerage",
  description: "Login to access the Leuterio Realty & Brokerage contest management system.",
  openGraph: {
    title: "Authentication | Leuterio Realty & Brokerage",
    description: "Login to access the Leuterio Realty & Brokerage contest management system.",
    url: `${SITE_URL}/auth/login`,
    siteName: "Leuterio Realty & Brokerage Contests",
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Leuterio Realty & Brokerage Authentication",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="py-12">{children}</div>
    </div>
  )
}
