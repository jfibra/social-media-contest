"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, error, clearError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearError()

    try {
      const success = await login({ email, password })

      if (success) {
        router.push("/admin/dashboard")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="relative h-16 w-48">
              <Image
                src="https://leuteriorealty.com/logomaterials/LeuterioRealty/Leuterio%20Realty%20logo%20black.png"
                alt="Leuterio Realty"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-realty-primary mb-6">Admin Login</h1>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-realty-text mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-realty-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-realty-primary hover:bg-realty-secondary text-white py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-realty-secondary hover:text-realty-primary">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
