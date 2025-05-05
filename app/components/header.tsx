"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll position for subtle header effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white border-b transition-all duration-300",
        isScrolled ? "shadow-md py-2" : "py-4",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative flex items-center group">
            <div className="relative h-12 w-48 overflow-hidden">
              <Image
                src="https://leuteriorealty.com/logomaterials/LeuterioRealty/Leuterio%20Realty%20logo%20black.png"
                alt="Leuterio Realty"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-realty-primary/10 scale-0 rounded-lg group-hover:scale-100 transition-transform duration-300"></div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="relative px-4 py-2 font-medium text-realty-primary hover:text-realty-highlight transition-colors duration-300 group"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-realty-highlight scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>

            <Link
              href="/contests"
              className="relative px-4 py-2 font-medium text-realty-primary hover:text-realty-highlight transition-colors duration-300 group"
            >
              <span>Contests</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-realty-highlight scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>

            <Link
              href="https://leuteriorealty.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-5 py-2 bg-realty-primary text-white rounded-md font-medium hover:bg-realty-secondary transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Main Website
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-10 p-2 rounded-md bg-realty-primary/5 hover:bg-realty-primary/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span
                className={cn(
                  "absolute block h-0.5 bg-realty-primary rounded-full transition-all duration-300 w-6",
                  isMobileMenuOpen ? "top-3 rotate-45" : "top-1",
                )}
              ></span>
              <span
                className={cn(
                  "absolute top-3 block h-0.5 bg-realty-primary rounded-full transition-all duration-300",
                  isMobileMenuOpen ? "w-0 opacity-0" : "w-6 opacity-100",
                )}
              ></span>
              <span
                className={cn(
                  "absolute block h-0.5 bg-realty-primary rounded-full transition-all duration-300 w-6",
                  isMobileMenuOpen ? "top-3 -rotate-45" : "top-5",
                )}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-white transform transition-transform duration-300 ease-in-out md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex flex-col h-full pt-20 pb-6 px-6 overflow-y-auto">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="px-4 py-3 font-medium text-realty-primary hover:text-realty-highlight transition-colors duration-300 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                href="/contests"
                className="px-4 py-3 font-medium text-realty-primary hover:text-realty-highlight transition-colors duration-300 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contests
              </Link>

              <Link
                href="https://leuteriorealty.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-4 py-3 bg-realty-primary text-white rounded-md font-medium text-center hover:bg-realty-secondary transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Main Website
              </Link>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex justify-center space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-realty-primary/10 text-realty-primary hover:bg-realty-primary hover:text-white transition-colors duration-300"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-realty-primary/10 text-realty-primary hover:bg-realty-primary hover:text-white transition-colors duration-300"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
