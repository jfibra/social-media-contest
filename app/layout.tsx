import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "./components/header"
import Footer from "./components/footer"
import { SITE_URL } from "./env"
import { AuthProvider } from "@/contexts/auth-context"
// Import the AuthDebug component
import AuthDebug from "@/components/auth-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Social Media Contests | Leuterio Realty & Brokerage",
    template: "%s | Leuterio Realty & Brokerage Contests",
  },
  description:
    "Join exciting social media contests hosted by Leuterio Realty & Brokerage. Win prizes and engage with top real estate professionals in the Philippines.",
  keywords: [
    "Philippines real estate contests",
    "Leuterio Realty social media contest",
    "Win prizes Leuterio agents",
    "real estate marketing",
    "social media contest",
    "Leuterio Realty",
    "property contest",
    "real estate competition",
    "Filipino Homes contest",
  ],
  authors: [{ name: "Leuterio Realty & Brokerage" }],
  creator: "Leuterio Realty & Brokerage",
  publisher: "Leuterio Realty & Brokerage",
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Social Media Contests | Leuterio Realty & Brokerage",
    description:
      "Join exciting social media contests hosted by Leuterio Realty & Brokerage. Win prizes and engage with top real estate professionals in the Philippines.",
    siteName: "Leuterio Realty & Brokerage Contests",
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Leuterio Realty & Brokerage Social Media Contests",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Contests | Leuterio Realty & Brokerage",
    description:
      "Join exciting social media contests hosted by Leuterio Realty & Brokerage. Win prizes and engage with top real estate professionals in the Philippines.",
    images: [`${SITE_URL}/images/og-image.png`],
    creator: "@leuteriorealty",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "verification_token", // Replace with actual verification token if available
  },
    generator: 'v0.dev'
}

// Add the AuthDebug component to the layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <AuthDebug />
        </AuthProvider>
      </body>
    </html>
  )
}
