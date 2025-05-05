import Image from "next/image"
import Link from "next/link"
import type { Contest } from "@/types/contest"
import { getDateRange } from "@/lib/utils"
import { Calendar, ArrowRight, Award } from "lucide-react"

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

      {/* Animated Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Floating Elements */}
      <div
        className="absolute top-1/4 left-1/4 w-12 h-12 bg-realty-highlight/20 rounded-full animate-bounce"
        style={{ animationDuration: "3s" }}
      ></div>
      <div
        className="absolute bottom-1/3 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-bounce"
        style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
      ></div>

      <div className="container relative z-10 mx-auto px-4 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-white space-y-6 animate-fadeIn">
            <div className="inline-flex items-center bg-realty-highlight px-4 py-2 rounded-md text-sm font-medium mb-2 shadow-lg">
              <Award className="mr-2 h-4 w-4" />
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

            <div className="flex items-center text-gray-200 space-x-2 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Contest Period:</span>
              <span>{getDateRange(contest.startDate, contest.endDate)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={`/contests/${contest.slug}`}
                className="bg-realty-highlight hover:bg-opacity-90 text-white px-8 py-3 rounded-md font-medium text-center transition-all duration-300 transform hover:-translate-y-1 shadow-lg group"
              >
                Join the Contest
                <ArrowRight className="inline-block ml-2 transition-transform group-hover:translate-x-1" />
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
              {/* Contest Poster with Animation */}
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500 group">
                <Image
                  src={contest.posterUrl || "/placeholder.svg?height=600&width=800&query=real+estate+contest"}
                  alt={contest.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="font-bold text-xl">{contest.name}</p>
                  <p className="text-sm">Click to join and learn more</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-5 -right-5 w-20 h-20 border-4 border-white/20 rounded-lg transform rotate-12"></div>
              <div className="absolute -bottom-5 -left-5 w-16 h-16 border-4 border-realty-highlight/30 rounded-lg transform -rotate-6"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
