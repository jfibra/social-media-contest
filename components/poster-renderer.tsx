"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import {
  posterSizes,
  drawTextWithWrapping,
  createLinearGradient,
  roundRect,
  drawPattern,
  drawDecorativeElement,
  getFontByAesthetic,
} from "@/lib/canvas-utils"

interface PosterRendererProps {
  formData: any
  previewOnly?: boolean
  width?: number
  height?: number
}

export function PosterRenderer({ formData, previewOnly = false, width, height }: PosterRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)

  // Get poster dimensions
  const getPosterDimensions = () => {
    if (width && height) {
      return { width, height }
    }

    const posterSize = formData.posterSize || "instagram-post"
    return posterSizes[posterSize as keyof typeof posterSizes] || posterSizes["instagram-post"]
  }

  // Scale canvas for high resolution
  const scaleCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Set display size
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Set actual size in memory (scaled for retina)
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Scale context to match
    ctx.scale(dpr, dpr)

    return { scaledWidth: width, scaledHeight: height }
  }

  // Load images
  useEffect(() => {
    const loadImage = (src: string | File): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()

        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error("Failed to load image"))

        if (src instanceof File) {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              img.src = e.target.result as string
            }
          }
          reader.readAsDataURL(src)
        } else if (typeof src === "string" && src) {
          img.src = src
        } else {
          reject(new Error("Invalid image source"))
        }
      })
    }

    // Load logo if available
    if (formData.logo) {
      loadImage(formData.logo)
        .then((img) => setLogoImage(img))
        .catch((err) => console.error("Error loading logo:", err))
    }

    // Load background if available
    if (formData.background) {
      loadImage(formData.background)
        .then((img) => setBackgroundImage(img))
        .catch((err) => console.error("Error loading background:", err))
    }
  }, [formData.logo, formData.background])

  // Render the poster
  useEffect(() => {
    const renderPoster = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        setError("Canvas context not supported")
        return
      }

      setIsRendering(true)
      setError(null)

      try {
        // Get dimensions
        const { width: posterWidth, height: posterHeight } = getPosterDimensions()

        // Scale canvas
        const { scaledWidth, scaledHeight } = scaleCanvas(canvas, ctx, posterWidth, posterHeight)

        // Clear canvas
        ctx.clearRect(0, 0, scaledWidth, scaledHeight)

        // Set colors
        const primaryColor = formData.colorScheme.primary || "#001f3f"
        const secondaryColor = formData.colorScheme.secondary || "#000000"
        const accentColor = formData.colorScheme.accent || "#FF0000"

        // Draw background
        if (backgroundImage) {
          // Draw uploaded background image
          ctx.drawImage(backgroundImage, 0, 0, scaledWidth, scaledHeight)

          // Add overlay for better text visibility
          ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
          ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        } else {
          // Create gradient background based on selected colors
          const gradient = createLinearGradient(ctx, 0, 0, scaledWidth, scaledHeight, [
            [0, primaryColor],
            [1, secondaryColor],
          ])

          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, scaledWidth, scaledHeight)
        }

        // Apply styling based on selected aesthetics
        if (formData.styling && formData.styling.length > 0) {
          // Get primary styling
          const primaryStyle = formData.styling[0]

          // Apply decorative elements based on selected style
          switch (primaryStyle) {
            case "playful-modern":
              // Draw playful circles and patterns
              drawPattern(ctx, "dots", 0, 0, scaledWidth, scaledHeight, [accentColor])
              drawDecorativeElement(ctx, "circles", 0, 0, scaledWidth, scaledHeight, accentColor)
              break

            case "elegant-minimalist":
              // Draw subtle lines
              drawDecorativeElement(ctx, "lines", 0, 0, scaledWidth, scaledHeight, "#ffffff")
              break

            case "retro-vibes":
              // Draw halftone pattern
              drawDecorativeElement(ctx, "halftone", 0, 0, scaledWidth, scaledHeight, "#ffffff")
              break

            case "corporate-clean":
              // Draw subtle grid
              drawDecorativeElement(ctx, "grid", 0, 0, scaledWidth, scaledHeight, "#ffffff")
              break

            case "grunge-edgy":
              // Add texture effect
              ctx.globalAlpha = 0.1
              drawPattern(ctx, "stripes", 0, 0, scaledWidth, scaledHeight, ["#ffffff"])
              ctx.globalAlpha = 1
              break

            case "youthful-vibrant":
              // Add confetti-like elements
              drawDecorativeElement(ctx, "stars", 0, 0, scaledWidth, scaledHeight, accentColor)
              break

            case "luxury":
              // Add gold accents
              drawDecorativeElement(ctx, "gold-accents", 0, 0, scaledWidth, scaledHeight, "#D4AF37")
              break

            case "tech":
              // Add circuit pattern
              drawDecorativeElement(ctx, "circuit", 0, 0, scaledWidth, scaledHeight, "#ffffff")
              break

            default:
              break
          }
        }

        // Add secondary styling if available
        if (formData.styling && formData.styling.length > 1) {
          const secondaryStyle = formData.styling[1]

          // Apply lighter version of decorative elements
          ctx.globalAlpha = 0.5
          if (secondaryStyle === "nature-inspired") {
            drawDecorativeElement(ctx, "waves", 0, 0, scaledWidth, scaledHeight, "#ffffff")
          } else if (secondaryStyle === "retro-vibes") {
            drawDecorativeElement(ctx, "rectangles", 0, 0, scaledWidth, scaledHeight, accentColor)
          }
          ctx.globalAlpha = 1
        }

        // Draw header/title section
        const titleY = scaledHeight * 0.2
        const titleFontSize = Math.round(scaledHeight * 0.06)
        const subtitleFontSize = Math.round(scaledHeight * 0.03)

        // Set font based on aesthetic or font preference
        let fontFamily = "system-ui, sans-serif"

        if (formData.fontPreference) {
          fontFamily = formData.fontPreference
        } else if (formData.styling && formData.styling.length > 0) {
          fontFamily = getFontByAesthetic(formData.styling[0])
        }

        // Draw event type as small heading
        if (formData.eventType) {
          ctx.font = `bold ${subtitleFontSize}px ${fontFamily}`
          ctx.textAlign = "center"
          ctx.fillStyle = "#ffffff"
          ctx.fillText(formData.eventType.toUpperCase(), scaledWidth / 2, titleY - titleFontSize)
        }

        // Draw main title
        ctx.font = `bold ${titleFontSize}px ${fontFamily}`
        ctx.textAlign = "center"
        ctx.fillStyle = "#ffffff"
        drawTextWithWrapping(
          ctx,
          formData.title || "Your Event Title",
          scaledWidth / 2,
          titleY,
          scaledWidth * 0.8,
          titleFontSize * 1.2,
        )

        // Draw headline/slogan
        if (formData.headline) {
          const headlineFontSize = Math.round(scaledHeight * 0.04)
          ctx.font = `italic ${headlineFontSize}px ${fontFamily}`
          ctx.fillStyle = accentColor
          ctx.textAlign = "center"

          const headlineY = titleY + titleFontSize * 2
          drawTextWithWrapping(
            ctx,
            formData.headline,
            scaledWidth / 2,
            headlineY,
            scaledWidth * 0.7,
            headlineFontSize * 1.3,
          )
        }

        // Draw date and time
        if (formData.dateTime) {
          const dateTimeFontSize = Math.round(scaledHeight * 0.03)
          ctx.font = `${dateTimeFontSize}px ${fontFamily}`
          ctx.fillStyle = "#ffffff"
          ctx.textAlign = "center"

          const dateY = scaledHeight * 0.6

          // Draw date icon
          ctx.beginPath()
          ctx.arc(
            scaledWidth / 2 - dateTimeFontSize * 5,
            dateY - dateTimeFontSize / 3,
            dateTimeFontSize / 2,
            0,
            Math.PI * 2,
          )
          ctx.fillStyle = accentColor
          ctx.fill()

          ctx.fillStyle = "#ffffff"
          ctx.fillText(formData.dateTime, scaledWidth / 2, dateY)
        }

        // Draw venue/location
        if (formData.venue) {
          const venueFontSize = Math.round(scaledHeight * 0.025)
          ctx.font = `${venueFontSize}px ${fontFamily}`
          ctx.fillStyle = "#ffffff"
          ctx.textAlign = "center"

          const venueY = scaledHeight * 0.65

          // Draw location icon
          ctx.beginPath()
          ctx.arc(scaledWidth / 2 - venueFontSize * 5, venueY - venueFontSize / 3, venueFontSize / 2, 0, Math.PI * 2)
          ctx.fillStyle = accentColor
          ctx.fill()

          ctx.fillStyle = "#ffffff"
          ctx.fillText(formData.venue, scaledWidth / 2, venueY)
        }

        // Draw description
        if (formData.description) {
          const descFontSize = Math.round(scaledHeight * 0.02)
          ctx.font = `${descFontSize}px ${fontFamily}`
          ctx.fillStyle = "#ffffff"
          ctx.textAlign = "center"

          // Create description box
          const descPadding = 20
          const descMaxWidth = scaledWidth * 0.8
          const descriptionY = scaledHeight * 0.75

          // Add slightly transparent background for better readability
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
          roundRect(
            ctx,
            scaledWidth / 2 - descMaxWidth / 2,
            descriptionY - descFontSize,
            descMaxWidth,
            descFontSize * 6,
            10,
          )
          ctx.fill()

          ctx.fillStyle = "#ffffff"
          drawTextWithWrapping(
            ctx,
            formData.description,
            scaledWidth / 2,
            descriptionY,
            descMaxWidth - descPadding * 2,
            descFontSize * 1.5,
          )
        }

        // Draw logo
        if (logoImage) {
          const logoMaxWidth = scaledWidth * 0.2
          const logoMaxHeight = scaledHeight * 0.1

          // Calculate logo dimensions while maintaining aspect ratio
          const logoRatio = logoImage.width / logoImage.height
          let logoWidth, logoHeight

          if (logoImage.width > logoImage.height) {
            logoWidth = Math.min(logoImage.width, logoMaxWidth)
            logoHeight = logoWidth / logoRatio
          } else {
            logoHeight = Math.min(logoImage.height, logoMaxHeight)
            logoWidth = logoHeight * logoRatio
          }

          // Position logo at bottom right
          const logoX = scaledWidth - logoWidth - 20
          const logoY = scaledHeight - logoHeight - 20

          // Draw logo with slight shadow for visibility
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
          ctx.shadowBlur = 10
          ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)
          ctx.shadowBlur = 0
        }

        // Add company name or website at bottom
        const companyText = "Leuterio Realty"
        const companyFontSize = Math.round(scaledHeight * 0.018)
        ctx.font = `${companyFontSize}px ${fontFamily}`
        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "center"
        ctx.fillText(companyText, scaledWidth / 2, scaledHeight - companyFontSize * 2)
      } catch (err) {
        console.error("Error rendering poster:", err)
        setError("Failed to render poster")
      } finally {
        setIsRendering(false)
      }
    }

    // Render the poster
    renderPoster()
  }, [formData, logoImage, backgroundImage])

  // Download poster as image
  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const link = document.createElement("a")
      link.download = `${formData.title || "poster"}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("Error downloading poster:", err)
      setError("Failed to download poster")
    }
  }

  // Calculate aspect ratio for preview container
  const { width: posterWidth, height: posterHeight } = getPosterDimensions()
  const aspectRatio = posterHeight / posterWidth
  const maxPreviewWidth = previewOnly ? width || 400 : 800
  const previewHeight = maxPreviewWidth * aspectRatio

  return (
    <div className="flex flex-col items-center w-full">
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div
        className="border rounded shadow-md overflow-hidden bg-gray-800"
        style={{
          width: previewOnly ? width : "100%",
          maxWidth: previewOnly ? width : maxPreviewWidth,
          height: previewOnly ? height : previewHeight,
        }}
      >
        <canvas ref={canvasRef} className={`w-full h-full ${isRendering ? "opacity-50" : ""}`} />

        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="animate-spin text-white" />
          </div>
        )}
      </div>

      {!previewOnly && (
        <div className="flex justify-center mt-4">
          <Button onClick={downloadPoster} disabled={isRendering} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Poster
          </Button>
        </div>
      )}
    </div>
  )
}
