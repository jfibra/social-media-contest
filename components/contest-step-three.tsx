"use client"

import type React from "react"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileUploader } from "./file-uploader"

interface ContestStepThreeProps {
  formData: any
  updateFormData: (data: any) => void
}

// Company logos array with direct image URLs
const COMPANY_LOGOS = [
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/fh_logo.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FH_PRC_logo.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FH_PRC_logowhite.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FHGOLD.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FHGOLD2.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/fhlogo-overlay.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FHLogo.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FHLogo2.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FHLogo3.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FILIPINO+HOMES+LOGO+REVISION.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FILIPINO+HOMES+LOGO+REVISION2.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FILIPINO+HOMES+LOGO+REVISIONWHITE.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FILIPINO+HOMES+SQUARE.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FILIPINO+HOMES+SQUARE2.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/FILIPINO+HOMES+SQUARE3.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/filipinohomes.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/lr+logo+gold.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/lr+logo+white.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/lr+logo.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/lrlogo.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/Rent+PH+gold+logo.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/RENT_PH+B.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/rent-ph.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/rentph_logo.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/company_logo/rentph.png",
]

// Team logos array with direct image URLs
const TEAM_LOGOS = [
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/BEX+Team.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Chin+Dynasty.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Davao+Eagles+DIRECT.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Dreamchasers.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Elite+Team.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/FH+Racstars.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Filipino+Homes+Team+8.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/FILIPINOHOMES+KAIZEN+OZAMIZ+TEAM.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Filipinohomes+VIP.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/G-Force.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Golden+Aces.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/JLD+LOGO+final.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Leuterio+Direct.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Leuterio+Realty+Bohol.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Aces.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Alliance.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Camsur.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Direct+2.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Dream+Team.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Fantastic.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+PATRIOTS.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Powerhouse+2.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Powerhouse+3.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Powerhouse.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Realty+Masters.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Star.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Tech+Squad.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LR+Upgrade.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LRDirect3.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LRDirect4.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/LROzamiz.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Luzon+Leaders.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Red+Diamonds.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/RockStarAgents.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Solid+LR+Team.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Starlight+Team.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/StarShooters.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+8.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+A.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+Alpha.jpeg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+Champions.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+Equality.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+G.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+Royalties+2.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+Tycoons.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Team+X+Factor.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/The+Extreme+Millionaires.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/The+Prodigies.png",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Vanguard+2.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Vanguard.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Victorious+Secret.jpg",
  "https://filipinohomes123.s3.ap-southeast-1.amazonaws.com/social_media/team_logo/Wire+Toppers.png",
]

export function ContestStepThree({ formData, updateFormData }: ContestStepThreeProps) {
  const [companyLogoDialogOpen, setCompanyLogoDialogOpen] = useState(false)
  const [teamLogoDialogOpen, setTeamLogoDialogOpen] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateFormData({ ...formData, [name]: value })
  }

  const handleSelectLogo = (logoUrl: string) => {
    updateFormData({ ...formData, logo_url: logoUrl })
    setCompanyLogoDialogOpen(false)
    setTeamLogoDialogOpen(false)
  }

  const handleLogoUploadComplete = (url: string) => {
    updateFormData({ ...formData, logo_url: url })
  }

  const handlePosterUploadComplete = (url: string) => {
    updateFormData({ ...formData, poster_url: url })
  }

  // Get sanitized contest name for file uploads
  const getUploadFileName = () => {
    return formData.contest_name ? formData.contest_name.replace(/[^A-Za-z0-9-]/g, "_") : "contest"
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dates and Images</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="logo_url" className="block text-sm font-medium text-realty-text mb-2">
            Logo URL
          </label>

          {/* Logo Preview */}
          {formData.logo_url && (
            <div className="mb-3 p-2 border rounded-md bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Logo Preview:</div>
              <div className="h-24 flex items-center justify-center bg-white rounded border">
                <img
                  src={formData.logo_url || "/placeholder.svg"}
                  alt="Logo Preview"
                  className="max-h-20 max-w-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/abstract-logo.png"
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setCompanyLogoDialogOpen(true)}
            >
              <ImageIcon className="h-4 w-4" />
              Company Logo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setTeamLogoDialogOpen(true)}
            >
              <ImageIcon className="h-4 w-4" />
              Team Logo
            </Button>
            <FileUploader type="logo" onUploadComplete={handleLogoUploadComplete} fileName={getUploadFileName()} />
          </div>
          <input
            type="url"
            id="logo_url"
            name="logo_url"
            value={formData.logo_url || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <label htmlFor="poster_url" className="block text-sm font-medium text-realty-text mb-2">
            Poster URL
          </label>

          {/* Poster Preview */}
          {formData.poster_url && (
            <div className="mb-3 p-2 border rounded-md bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Poster Preview:</div>
              <div className="h-24 flex items-center justify-center bg-white rounded border">
                <img
                  src={formData.poster_url || "/placeholder.svg"}
                  alt="Poster Preview"
                  className="max-h-20 max-w-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/abstract-logo.png"
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-2">
            <FileUploader type="poster" onUploadComplete={handlePosterUploadComplete} fileName={getUploadFileName()} />
          </div>
          <input
            type="url"
            id="poster_url"
            name="poster_url"
            value={formData.poster_url || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            placeholder="https://example.com/poster.png"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-realty-text mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="start_time"
            name="start_time"
            value={formData.start_time || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-realty-text mb-2">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="end_time"
            name="end_time"
            value={formData.end_time || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="entry_deadline" className="block text-sm font-medium text-realty-text mb-2">
            Entry Deadline
          </label>
          <input
            type="datetime-local"
            id="entry_deadline"
            name="entry_deadline"
            value={formData.entry_deadline || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-realty-primary"
          />
        </div>
      </div>

      {/* Company Logo Dialog */}
      <Dialog open={companyLogoDialogOpen} onOpenChange={setCompanyLogoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Company Logo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {COMPANY_LOGOS.map((logo, index) => (
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
                      ;(e.target as HTMLImageElement).src = "/abstract-logo.png"
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 truncate">{logo.split("/").pop()?.replace(/\+/g, " ")}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Logo Dialog */}
      <Dialog open={teamLogoDialogOpen} onOpenChange={setTeamLogoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Team Logo</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {TEAM_LOGOS.map((logo, index) => (
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
                      ;(e.target as HTMLImageElement).src = "/abstract-logo.png"
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 truncate">{logo.split("/").pop()?.replace(/\+/g, " ")}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
