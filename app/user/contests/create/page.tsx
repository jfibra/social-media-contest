"use client"

import Link from "next/link"
import ContestForm from "@/components/contest-form"
import { ArrowLeft } from "lucide-react"

export default function UserCreateContestPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/user/contests"
            className="text-realty-secondary hover:text-realty-primary transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Contests
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold">Create New Contest</h1>
          <p className="text-realty-text">Create a new social media contest for your team or event.</p>
        </div>

        <ContestForm isAdmin={false} />
      </div>
    </div>
  )
}
