import Image from "next/image"
import Link from "next/link"
import type { Contest } from "@/types/contest"
import { getDateRange } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface ContestCardProps {
  contest: Contest
  featured?: boolean
  className?: string
}

export default function ContestCard({ contest, featured = false, className = "" }: ContestCardProps) {
  return (
    <div className={`contest-card ${className} ${featured ? "md:col-span-2" : ""}`}>
      <Link href={`/contests/${contest.slug}`}>
        <div className="relative h-48 md:h-64 w-full overflow-hidden">
          <Image
            src={contest.posterUrl || "/placeholder.svg?height=400&width=600&query=real+estate+contest"}
            alt={contest.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          {contest.status === "active" && (
            <div className="absolute top-4 right-4 bg-realty-highlight text-white px-3 py-1 rounded-full text-sm font-medium">
              Active
            </div>
          )}
        </div>
        <div className="p-4 bg-white">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-realty-secondary" />
            <span className="text-sm text-realty-secondary">{getDateRange(contest.startDate, contest.endDate)}</span>
          </div>
          <h3 className={`${featured ? "text-2xl" : "text-xl"} font-bold mb-2 line-clamp-2`}>{contest.name}</h3>
          <p className="text-realty-text line-clamp-2">{contest.description}</p>
        </div>
      </Link>
    </div>
  )
}
