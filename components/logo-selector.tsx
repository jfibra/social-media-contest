"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

interface LogoSelectorProps {
  onSelectLogo: (logoUrl: string) => void
  type: "company" | "team"
  currentLogo?: string
}

// Convert S3 console URLs to direct image URLs
const extractFilenameFromS3Url = (url: string): string => {
  const prefixParam = url.split("prefix=")[1]
  if (!prefixParam) return ""
  return prefixParam
}

// Company logos array
const COMPANY_LOGOS = [
  "social_media/company_logo/fh_logo.png",
  "social_media/company_logo/FH_PRC_logo.png",
  "social_media/company_logo/FH_PRC_logowhite.png",
  "social_media/company_logo/FHGOLD.png",
  "social_media/company_logo/FHGOLD2.png",
  "social_media/company_logo/fhlogo-overlay.png",
  "social_media/company_logo/FHLogo.png",
  "social_media/company_logo/FHLogo2.png",
  "social_media/company_logo/FHLogo3.png",
  "social_media/company_logo/FILIPINO+HOMES+LOGO+REVISION.png",
  "social_media/company_logo/FILIPINO+HOMES+LOGO+REVISION2.png",
  "social_media/company_logo/FILIPINO+HOMES+LOGO+REVISIONWHITE.png",
  "social_media/company_logo/FILIPINO+HOMES+SQUARE.png",
  "social_media/company_logo/FILIPINO+HOMES+SQUARE2.png",
  "social_media/company_logo/FILIPINO+HOMES+SQUARE3.png",
  "social_media/company_logo/filipinohomes.png",
  "social_media/company_logo/lr+logo+gold.png",
  "social_media/company_logo/lr+logo+white.png",
  "social_media/company_logo/lr+logo.png",
  "social_media/company_logo/lrlogo.png",
  "social_media/company_logo/Rent+PH+gold+logo.png",
  "social_media/company_logo/RENT_PH+B.png",
  "social_media/company_logo/rent-ph.png",
  "social_media/company_logo/rentph_logo.png",
  "social_media/company_logo/rentph.png",
].map((path) => `https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/${path}`)

// Team logos array (placeholder for now)
const TEAM_LOGOS: string[] = []

export function LogoSelector({ onSelectLogo, type, currentLogo }: LogoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<string | undefined>(undefined)
  const logos = type === "company" ? COMPANY_LOGOS : TEAM_LOGOS

  useEffect(() => {
    if (currentLogo) {
      setSelectedLogo(currentLogo)
    }
  }, [currentLogo])

  const handleSelectLogo = (logoUrl: string) => {
    setSelectedLogo(logoUrl)
    onSelectLogo(logoUrl)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {type === "company" ? "Company Logo" : "Team Logo"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a {type === "company" ? "Company" : "Team"} Logo</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="border rounded-md p-2 cursor-pointer hover:border-realty-primary transition-colors"
              onClick={() => handleSelectLogo(logo)}
            >
              <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                <img
                  src={logo || "/placeholder.svg"}
                  alt={`Logo ${index + 1}`}
                  className="max-w-full max-h-full object-contain p-2"
                  onError={(e) => {
                    // If image fails to load, show a placeholder
                    ;(e.target as HTMLImageElement).src = "/abstract-logo.png"
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 truncate">{logo.split("/").pop()}</div>
            </div>
          ))}
          {logos.length === 0 && <div className="col-span-full text-center py-8 text-gray-500">No logos available</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
