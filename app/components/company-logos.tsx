"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

export default function CompanyLogos() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const animateScroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0
      } else {
        scrollContainer.scrollLeft += 1
      }
    }

    const interval = setInterval(animateScroll, 30)
    return () => clearInterval(interval)
  }, [])

  const logos = [
    {
      name: "Filipino Homes",
      url: "https://leuteriorealty.com/logomaterials/FilipinoHomes/Filipinohomes%20logo%201.png",
      width: 180,
      height: 60,
    },
    {
      name: "Leuterio Realty and Brokerage",
      url: "https://leuteriorealty.com/logomaterials/LeuterioRealty/Leuterio%20Realty%20logo%20black.png",
      width: 200,
      height: 60,
    },
    {
      name: "Rent Ph",
      url: "https://leuteriorealty.com/logomaterials/RentPH/RentPh%20new%20colored%20logo.png",
      width: 160,
      height: 60,
    },
    {
      name: "Bayanihan",
      url: "https://bayanihan.com/assets/logo-7hJM8ZTM.png",
      width: 180,
      height: 60,
    },
  ]

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-lg text-gray-500 mb-6">Powered By</h2>

        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex items-center space-x-16 overflow-x-auto scrollbar-hide py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Double the logos to create seamless loop */}
            {[...logos, ...logos].map((logo, index) => (
              <div key={index} className="flex-shrink-0 px-4">
                <div className="relative" style={{ width: logo.width, height: logo.height }}>
                  <Image src={logo.url || "/placeholder.svg"} alt={logo.name} fill className="object-contain" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
