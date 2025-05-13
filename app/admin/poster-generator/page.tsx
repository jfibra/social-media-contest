"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Wand2 } from "lucide-react"
import { ColorPicker } from "@/components/color-picker"
import { MultiSelect, type Option } from "@/components/multi-select"
import { FileInput } from "@/components/file-input"
import { posterSizes } from "@/lib/canvas-utils"
import { CanvasEditor } from "@/components/interactive-editor/canvas-editor"
import { formDataToCanvasElements } from "@/components/interactive-editor/form-to-canvas"

const stylingOptions: Option[] = [
  { value: "playful-modern", label: "Playful & Modern" },
  { value: "elegant-minimalist", label: "Elegant & Minimalist" },
  { value: "retro-vibes", label: "Retro Vibes" },
  { value: "corporate-clean", label: "Corporate Clean" },
  { value: "grunge-edgy", label: "Grunge / Edgy" },
  { value: "youthful-vibrant", label: "Youthful / Vibrant" },
  { value: "luxury", label: "Luxury" },
  { value: "tech", label: "Tech-Focused" },
  { value: "nature-inspired", label: "Nature-Inspired" },
  { value: "artistic", label: "Artistic" },
]

export default function PosterGenerator() {
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    dateTime: "",
    venue: "",
    colorScheme: {
      primary: "#001f3f",
      secondary: "#000000",
      accent: "#FF0000",
    },
    styling: [] as string[],
    posterSize: "instagram-post",
    headline: "",
    description: "",
    fontPreference: "",
    logo: null as File | null,
    background: null as File | null,
    backgroundDescription: "",
  })

  const [showEditor, setShowEditor] = useState(false)
  const [canvasElements, setCanvasElements] = useState<any[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleColorChange = (colorType: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme,
        [colorType]: value,
      },
    }))
  }

  const handleStylingChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      styling: selected,
    }))
  }

  const handleFileChange = (fieldName: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }))
  }

  const handleReset = () => {
    setFormData({
      title: "",
      eventType: "",
      dateTime: "",
      venue: "",
      colorScheme: {
        primary: "#001f3f",
        secondary: "#000000",
        accent: "#FF0000",
      },
      styling: [],
      posterSize: "instagram-post",
      headline: "",
      description: "",
      fontPreference: "",
      logo: null,
      background: null,
      backgroundDescription: "",
    })
    setShowEditor(false)
  }

  const handleGenerateDesign = () => {
    // Convert form data to canvas elements
    const elements = formDataToCanvasElements(formData)
    setCanvasElements(elements)
    setShowEditor(true)

    // Scroll to editor
    setTimeout(() => {
      const editorElement = document.getElementById("canvas-editor")
      if (editorElement) {
        editorElement.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  // Get poster dimensions
  const getPosterDimensions = () => {
    const posterSize = formData.posterSize || "instagram-post"
    return posterSizes[posterSize as keyof typeof posterSizes] || posterSizes["instagram-post"]
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader className="bg-gradient-to-r from-realty-primary to-realty-secondary text-white">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6" />
              <CardTitle>Contest Poster Generator</CardTitle>
            </div>
            <CardDescription className="text-white text-opacity-90">
              Fill out the form below to generate a customized contest poster
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="design">Design Options</TabsTrigger>
                <TabsTrigger value="content">Content & Media</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Poster Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., This is Our Social Media Contest"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">Short, impactful name of the event or campaign</p>
                  </div>

                  <div>
                    <Label htmlFor="eventType">Event Type / Category</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange("eventType", value)}
                      value={formData.eventType}
                    >
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="contest">Contest</SelectItem>
                        <SelectItem value="product-launch">Product Launch</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="fundraiser">Fundraiser</SelectItem>
                        <SelectItem value="music-festival">Music Festival</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Select the type of event to guide the layout and visual tone
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="dateTime">Date & Time</Label>
                    <Input
                      id="dateTime"
                      name="dateTime"
                      placeholder="e.g., May 22, 2025 — 2:00 PM to 4:00 PM"
                      value={formData.dateTime}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">Specify the date and time of the event</p>
                  </div>

                  <div>
                    <Label htmlFor="venue">Venue / Location</Label>
                    <Input
                      id="venue"
                      name="venue"
                      placeholder="e.g., Zoom Meeting / Manila Convention Center"
                      value={formData.venue}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">Optional — Can be physical or virtual</p>
                  </div>

                  <div>
                    <Label htmlFor="posterSize">Poster Size / Format</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange("posterSize", value)}
                      value={formData.posterSize}
                    >
                      <SelectTrigger id="posterSize">
                        <SelectValue placeholder="Select poster size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram-post">Instagram Post (1080x1080)</SelectItem>
                        <SelectItem value="facebook-cover">Facebook Cover (820x312)</SelectItem>
                        <SelectItem value="a4-printable">A4 Printable (210x297mm)</SelectItem>
                        <SelectItem value="story">Instagram/Facebook Story (1080x1920)</SelectItem>
                        <SelectItem value="twitter-header">Twitter Header (1500x500)</SelectItem>
                        <SelectItem value="youtube-thumbnail">YouTube Thumbnail (1280x720)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">Choose the layout or platform format</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Color Scheme</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <ColorPicker
                        label="Primary Color"
                        color={formData.colorScheme.primary}
                        onChange={(color) => handleColorChange("primary", color)}
                      />
                      <ColorPicker
                        label="Secondary Color"
                        color={formData.colorScheme.secondary}
                        onChange={(color) => handleColorChange("secondary", color)}
                      />
                      <ColorPicker
                        label="Accent Color"
                        color={formData.colorScheme.accent}
                        onChange={(color) => handleColorChange("accent", color)}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Primary, secondary, and accent colors for your poster</p>
                  </div>

                  <div>
                    <Label htmlFor="styling" className="mb-2 block">
                      Styling & Aesthetic
                    </Label>
                    <MultiSelect
                      options={stylingOptions}
                      selected={formData.styling}
                      onChange={handleStylingChange}
                      placeholder="Select up to 3 styles"
                      maxItems={3}
                    />
                    <p className="text-sm text-gray-500 mt-1">Choose up to 3 visual styles or themes</p>
                  </div>

                  <div>
                    <Label htmlFor="fontPreference">Font Preference (Optional)</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange("fontPreference", value)}
                      value={formData.fontPreference}
                    >
                      <SelectTrigger id="fontPreference">
                        <SelectValue placeholder="Select font preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                        <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                        <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                        <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                        <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
                        <SelectItem value="system-ui, sans-serif">System Default</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 mt-1">
                      Specify fonts or let the system match based on the styling selected
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="headline">Main Headline / Slogan</Label>
                    <Input
                      id="headline"
                      name="headline"
                      placeholder="e.g., Join the Challenge & Win Big!"
                      value={formData.headline}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">Short message to grab attention</p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description / Details</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="e.g., Be part of our exciting social media contest! Post your entries using #OurChallenge and stand a chance to win exclusive merch and vouchers."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                    <p className="text-sm text-gray-500 mt-1">Brief description or overview of the event</p>
                  </div>

                  <div>
                    <Label>Logo / Branding Elements</Label>
                    <FileInput
                      value={formData.logo}
                      onChange={(file) => handleFileChange("logo", file)}
                      accept="image/*"
                      previewType="image"
                      buttonText="Upload Logo"
                      placeholder="Drag and drop your logo or branding elements here, or click to browse"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Background Image</Label>
                    <FileInput
                      value={formData.background}
                      onChange={(file) => handleFileChange("background", file)}
                      accept="image/*"
                      previewType="image"
                      buttonText="Upload Background"
                      placeholder="Drag and drop your background image here, or click to browse"
                      className="mt-2"
                    />

                    <div className="mt-4">
                      <Label htmlFor="backgroundDescription">Background Description</Label>
                      <Textarea
                        id="backgroundDescription"
                        name="backgroundDescription"
                        placeholder="e.g., Use a subtle gradient with a tech-themed background."
                        value={formData.backgroundDescription}
                        onChange={handleInputChange}
                        rows={2}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Optional description of the desired background if not uploading an image
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-8">
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                Reset Form
              </Button>

              <Button
                type="button"
                className="bg-realty-primary hover:bg-realty-primary/90 gap-2"
                onClick={handleGenerateDesign}
              >
                <Wand2 className="h-4 w-4" />
                Generate Design
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Canvas Editor */}
        {showEditor && (
          <div id="canvas-editor" className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Poster Editor</CardTitle>
                <CardDescription>
                  Click on elements to select them. Drag to move. Resize using the handles. Double-click text to edit.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CanvasEditor
                  width={getPosterDimensions().width}
                  height={getPosterDimensions().height}
                  initialElements={canvasElements}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
