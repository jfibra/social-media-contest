import Image from "next/image"
import Link from "next/link"
import type { Contest } from "@/types/contest"
import { getDateRange } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface HeroSectionProps {
  contest: Contest
}

export default function HeroSection({ contest }: HeroSectionProps) {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-realty-primary to-realty-secondary">
      {/* SVG Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{ backgroundImage: 'url("/images/pattern.png")', backgroundSize: "100px 100px" }}
      />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

      <div className="container relative z-10 mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-white space-y-6 animate-fadeIn">
            <div className="inline-block bg-realty-highlight px-4 py-2 rounded-md text-sm font-medium mb-2 shadow-lg">
              {contest.status === "active"
                ? "ACTIVE CONTEST"
                : contest.status === "upcoming"
                  ? "UPCOMING CONTEST"
                  : "COMPLETED CONTEST"}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">{contest.name}</h1>

            <p className="text-lg md:text-xl text-gray-100 max-w-xl">
              Join our exciting social media contest for agents attending our events and win amazing prizes! Showcase
              your experience and engage with the community.
            </p>

            <div className="flex items-center text-gray-200 space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Contest Period:</span>
              <span>{getDateRange(contest.startDate, contest.endDate)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={`/contests/${contest.slug}`}
                className="bg-realty-highlight hover:bg-opacity-90 text-white px-8 py-3 rounded-md font-medium text-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                Join the Contest
              </Link>
              <Link
                href="/contests"
                className="bg-white hover:bg-gray-100 text-realty-primary px-8 py-3 rounded-md font-medium text-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                View All Contests
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative flex justify-center items-center">
              {/* Contest Poster */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={contest.posterUrl || "/placeholder.svg?height=600&width=800&query=real+estate+contest"}
                  alt={contest.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
