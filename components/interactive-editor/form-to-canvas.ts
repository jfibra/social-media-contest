import type React from "react"
import { posterSizes } from "@/lib/canvas-utils"

// Define the form data interface
interface FormData {
  title: string
  eventType: string
  dateTime: string
  venue: string
  colorScheme: {
    primary: string
    secondary: string
    accent: string
  }
  styling: string[]
  posterSize: string
  headline: string
  description: string
  fontPreference: string
  logo: File | null
  background: File | null
  backgroundDescription: string
}

// Define the editor element interface
export interface EditorElement {
  id: string
  type: "text" | "image" | "shape" | "background"
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: React.CSSProperties
  src?: string
  color?: string
  fontSize?: number
  fontFamily?: string
}

// Convert form data to canvas elements
export function formDataToCanvasElements(formData: FormData): EditorElement[] {
  const elements: EditorElement[] = []

  // Get poster dimensions
  const posterSize = formData.posterSize || "instagram-post"
  const dimensions = posterSizes[posterSize as keyof typeof posterSizes] || posterSizes["instagram-post"]
  const { width, height } = dimensions

  // Add background
  elements.push({
    id: "background",
    type: "background",
    x: 0,
    y: 0,
    width,
    height,
    color: formData.colorScheme.primary,
  })

  // Add gradient overlay
  elements.push({
    id: "gradient-overlay",
    type: "shape",
    x: 0,
    y: 0,
    width,
    height,
    style: {
      background: `linear-gradient(135deg, ${formData.colorScheme.primary}, ${formData.colorScheme.secondary})`,
      opacity: 0.8,
    },
  })

  // Add title
  if (formData.title) {
    const fontSize = Math.round(height * 0.06)
    elements.push({
      id: "title",
      type: "text",
      x: width * 0.1,
      y: height * 0.2,
      width: width * 0.8,
      height: fontSize * 2,
      content: formData.title,
      fontSize,
      fontFamily: formData.fontPreference || "Arial, sans-serif",
      color: "#ffffff",
      style: {
        fontWeight: "bold",
        textAlign: "center",
      },
    })
  }

  // Add headline/slogan
  if (formData.headline) {
    const fontSize = Math.round(height * 0.04)
    elements.push({
      id: "headline",
      type: "text",
      x: width * 0.15,
      y: height * 0.35,
      width: width * 0.7,
      height: fontSize * 2,
      content: formData.headline,
      fontSize,
      fontFamily: formData.fontPreference || "Arial, sans-serif",
      color: formData.colorScheme.accent,
      style: {
        fontStyle: "italic",
        textAlign: "center",
      },
    })
  }

  // Add date and time
  if (formData.dateTime) {
    const fontSize = Math.round(height * 0.03)
    elements.push({
      id: "datetime",
      type: "text",
      x: width * 0.2,
      y: height * 0.5,
      width: width * 0.6,
      height: fontSize * 1.5,
      content: formData.dateTime,
      fontSize,
      fontFamily: formData.fontPreference || "Arial, sans-serif",
      color: "#ffffff",
      style: {
        textAlign: "center",
      },
    })
  }

  // Add venue
  if (formData.venue) {
    const fontSize = Math.round(height * 0.025)
    elements.push({
      id: "venue",
      type: "text",
      x: width * 0.2,
      y: height * 0.55,
      width: width * 0.6,
      height: fontSize * 1.5,
      content: formData.venue,
      fontSize,
      fontFamily: formData.fontPreference || "Arial, sans-serif",
      color: "#ffffff",
      style: {
        textAlign: "center",
      },
    })
  }

  // Add description
  if (formData.description) {
    const fontSize = Math.round(height * 0.02)
    elements.push({
      id: "description",
      type: "text",
      x: width * 0.15,
      y: height * 0.65,
      width: width * 0.7,
      height: fontSize * 6,
      content: formData.description,
      fontSize,
      fontFamily: formData.fontPreference || "Arial, sans-serif",
      color: "#ffffff",
      style: {
        textAlign: "center",
      },
    })
  }

  // Add decorative elements based on styling
  if (formData.styling.includes("playful-modern")) {
    // Add playful circles
    for (let i = 0; i < 5; i++) {
      const size = Math.random() * (width * 0.1) + width * 0.05
      elements.push({
        id: `circle-${i}`,
        type: "shape",
        x: Math.random() * (width - size),
        y: Math.random() * (height - size),
        width: size,
        height: size,
        color: formData.colorScheme.accent,
        style: {
          borderRadius: "50%",
          opacity: 0.2,
        },
      })
    }
  }

  // Add event type badge
  if (formData.eventType) {
    const fontSize = Math.round(height * 0.02)
    elements.push({
      id: "event-type",
      type: "shape",
      x: width * 0.35,
      y: height * 0.15,
      width: width * 0.3,
      height: fontSize * 2,
      color: formData.colorScheme.accent,
      style: {
        borderRadius: "20px",
      },
    })

    elements.push({
      id: "event-type-text",
      type: "text",
      x: width * 0.35,
      y: height * 0.15,
      width: width * 0.3,
      height: fontSize * 2,
      content: formData.eventType.toUpperCase(),
      fontSize,
      fontFamily: formData.fontPreference || "Arial, sans-serif",
      color: "#ffffff",
      style: {
        fontWeight: "bold",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    })
  }

  // Add company name at bottom
  elements.push({
    id: "company-name",
    type: "text",
    x: width * 0.2,
    y: height * 0.9,
    width: width * 0.6,
    height: Math.round(height * 0.02) * 1.5,
    content: "Leuterio Realty",
    fontSize: Math.round(height * 0.02),
    fontFamily: formData.fontPreference || "Arial, sans-serif",
    color: "#ffffff",
    style: {
      textAlign: "center",
    },
  })

  return elements
}
