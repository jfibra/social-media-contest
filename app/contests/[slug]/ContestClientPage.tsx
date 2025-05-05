"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Share2, Trophy, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { SITE_URL } from "@/app/env"
import { getDateRange } from "@/lib/utils"
import { submitContestEntry } from "@/app/actions/submit-contest-entry"
import { isContestAcceptingSubmissions } from "@/lib/api"

interface Contest {
  id: number
  slug: string
  name: string
  description: string
  startDate: string
  endDate: string
  posterUrl?: string
  logoUrl?: string
  status: "active" | "ended" | "upcoming" | "canceled"
  visibility?: "public" | "private"
  rules?: string
  prizes?: string
}

interface ContestClientPageProps {
  contest: Contest
}

export default function ContestClientPage({ contest }: ContestClientPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; message: string } | null>(null)

  // Check if contest is accepting submissions
  const acceptingSubmissions = isContestAcceptingSubmissions(contest)

  // Handle form submission
  async function handleSubmit(formData: FormData) {
    if (!acceptingSubmissions) return

    setIsSubmitting(true)
    setSubmissionResult(null)

    try {
      const result = await submitContestEntry(contest.id, formData)
      setSubmissionResult(result)

      // Reset form if submission was successful
      if (result.success) {
        const form = document.getElementById("contest-form") as HTMLFormElement
        if (form) form.reset()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmissionResult({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)

      // Scroll to result message
      setTimeout(() => {
        const resultElement = document.getElementById("submission-result")
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
  }

  // Determine status badge color
  const statusColor =
    {
      active: "bg-green-500",
      upcoming: "bg-realty-highlight",
      ended: "bg-gray-500",
      canceled: "bg-red-500",
    }[contest.status] || "bg-realty-highlight"

  // Determine status label
  const statusLabel =
    {
      active: "Active",
      upcoming: "Upcoming",
      ended: "Ended",
      canceled: "Canceled",
    }[contest.status] || "Unknown"

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/contests"
            className="text-realty-secondary hover:text-realty-primary transition-colors inline-flex items-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Contests
          </Link>
        </div>

        {contest.status === "canceled" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-700">This contest has been canceled. Please check our other available contests.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 opacity-0 animate-fadeIn">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden mb-8">
              <Image
                src={contest.posterUrl || "/placeholder.svg?height=500&width=800&query=real+estate+contest+poster"}
                alt={contest.name}
                fill
                priority
                className="object-cover"
              />
              <div className={`absolute top-4 right-4 ${statusColor} text-white px-4 py-2 rounded-full`}>
                {statusLabel}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{contest.name}</h1>

            <div className="flex items-center mb-6">
              <Calendar className="h-5 w-5 text-realty-secondary mr-2" />
              <span className="text-realty-secondary">{getDateRange(contest.startDate, contest.endDate)}</span>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-lg">{contest.description}</p>
            </div>

            {/* Contest Rules Section - Moved from below */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-realty-primary mr-2" />
                <h2 className="text-2xl font-bold">Contest Rules</h2>
              </div>
              <div className="prose max-w-none whitespace-pre-wrap">
                <p>{contest.rules || "No rules specified for this contest."}</p>
              </div>
            </div>

            {/* Prizes Section - Moved from below */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center mb-4">
                <Trophy className="h-6 w-6 text-realty-primary mr-2" />
                <h2 className="text-2xl font-bold">Prizes</h2>
              </div>
              <div className="prose max-w-none whitespace-pre-wrap">
                <p>{contest.prizes || "No prizes specified for this contest."}</p>
              </div>
            </div>
          </div>

          <div className="opacity-0 animate-fadeIn animate-delay-200">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="relative h-[200px] w-full mb-6">
                <Image
                  src={contest.logoUrl || "/placeholder.svg?height=200&width=200&query=contest+logo"}
                  alt={`${contest.name} Logo`}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Contest Information</h3>
                <p className="text-realty-text mb-4">
                  {acceptingSubmissions
                    ? "This contest is currently accepting entries. Scroll down to participate!"
                    : "This contest is not currently accepting entries."}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold mb-4">Share This Contest</h3>
                <div className="flex justify-center space-x-4">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/contests/${contest.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1877F2] text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                    aria-label="Share on Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                    </svg>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${contest.name} by Leuterio Realty & Brokerage!`)}&url=${encodeURIComponent(`${SITE_URL}/contests/${contest.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1DA1F2] text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                    aria-label="Share on Twitter"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${SITE_URL}/contests/${contest.slug}`)}&title=${encodeURIComponent(contest.name)}&summary=${encodeURIComponent(contest.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0077B5] text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${SITE_URL}/contests/${contest.slug}`)
                      alert("Link copied to clipboard!")
                    }}
                    className="bg-realty-secondary text-white p-2 rounded-full hover:opacity-90 transition-opacity"
                    aria-label="Copy link"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {acceptingSubmissions && (
          <div id="participate-form" className="mt-16 opacity-0 animate-fadeIn animate-delay-300">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Participate in {contest.name}</h2>

              {submissionResult && (
                <div
                  id="submission-result"
                  className={`mb-6 p-4 rounded-md ${
                    submissionResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-start">
                    {submissionResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                    )}
                    <p className={submissionResult.success ? "text-green-700" : "text-red-700"}>
                      {submissionResult.message}
                    </p>
                  </div>
                </div>
              )}

              <form id="contest-form" action={handleSubmit} className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-realty-text mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-realty-text mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="phone_number" className="block text-sm font-medium text-realty-text mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
                    placeholder="+63 XXX XXX XXXX"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="social_media_link" className="block text-sm font-medium text-realty-text mb-2">
                    Social Media Post Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="social_media_link"
                    name="social_media_link"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
                    placeholder="https://facebook.com/your-post"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="initial_likes" className="block text-sm font-medium text-realty-text mb-2">
                    Current Number of Likes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="initial_likes"
                    name="initial_likes"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
                    placeholder="Enter the current number of likes on your post"
                    required
                  />
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">Important Submission Guidelines:</h4>
                      <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                        <li>
                          Make sure your social media post is set to <strong>public</strong>
                        </li>
                        <li>Include all required hashtags as specified in the contest rules</li>
                        <li>Follow all contest rules carefully</li>
                        <li>We will verify your post and the number of likes after submission</li>
                        <li>Only one submission per person is allowed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-start">
                    <input type="checkbox" name="agree_terms" className="mt-1 mr-2" required />
                    <span className="text-sm text-realty-text">
                      I agree to the{" "}
                      <a href="#" className="text-realty-secondary hover:text-realty-primary">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-realty-secondary hover:text-realty-primary">
                        Privacy Policy
                      </a>{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-realty-highlight hover:bg-opacity-90 text-white px-8 py-3 rounded-md font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Entry"}
                  </button>
                </div>
              </form>
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
    </div>
  )
}
