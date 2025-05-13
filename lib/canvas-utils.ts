// Canvas drawing utilities

// Function to draw text with word wrap
export function drawTextWithWrapping(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(" ")
  let line = ""
  let testLine = ""
  let lineCount = 0

  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + " "
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y + lineCount * lineHeight)
      line = words[n] + " "
      lineCount++
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, y + lineCount * lineHeight)
  return lineCount + 1 // Return the number of lines drawn
}

// Function to create linear gradient
export function createLinearGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  colorStops: Array<[number, string]>,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2)

  colorStops.forEach(([stop, color]) => {
    gradient.addColorStop(stop, color)
  })

  return gradient
}

// Function to create radial gradient
export function createRadialGradient(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  colorStops: Array<[number, string]>,
): CanvasGradient {
  const gradient = ctx.createRadialGradient(x1, y1, r1, x2, y2, r2)

  colorStops.forEach(([stop, color]) => {
    gradient.addColorStop(stop, color)
  })

  return gradient
}

// Function to draw a rounded rectangle
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl: number; tr: number; br: number; bl: number },
) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius }
  }

  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + width - radius.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
  ctx.lineTo(x + width, y + height - radius.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
  ctx.lineTo(x + radius.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.quadraticCurveTo(x, y, x + radius.tl, y)
  ctx.closePath()
}

// Function to draw a pattern
export function drawPattern(
  ctx: CanvasRenderingContext2D,
  patternType: string,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: string[],
) {
  switch (patternType) {
    case "dots":
      const dotSize = 3
      const spacing = 15
      const dotColor = colors[0] || "#000000"
      ctx.fillStyle = dotColor

      for (let i = x; i < x + width; i += spacing) {
        for (let j = y; j < y + height; j += spacing) {
          ctx.beginPath()
          ctx.arc(i, j, dotSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break

    case "stripes":
      const stripeWidth = 10
      const stripeColor = colors[0] || "#000000"
      ctx.fillStyle = stripeColor

      for (let i = x; i < x + width; i += stripeWidth * 2) {
        ctx.fillRect(i, y, stripeWidth, height)
      }
      break

    case "grid":
      const gridSize = 20
      const lineWidth = 1
      const gridColor = colors[0] || "#000000"
      ctx.strokeStyle = gridColor
      ctx.lineWidth = lineWidth

      // Vertical lines
      for (let i = x; i <= x + width; i += gridSize) {
        ctx.beginPath()
        ctx.moveTo(i, y)
        ctx.lineTo(i, y + height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let j = y; j <= y + height; j += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, j)
        ctx.lineTo(x + width, j)
        ctx.stroke()
      }
      break

    case "zigzag":
      const zigHeight = 10
      const zigWidth = 20
      ctx.strokeStyle = colors[0] || "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = x; i < x + width; i += zigWidth) {
        if ((i - x) % (zigWidth * 2) === 0) {
          ctx.lineTo(i, y)
          ctx.lineTo(i + zigWidth, y + zigHeight)
        } else {
          ctx.lineTo(i, y + zigHeight)
          ctx.lineTo(i + zigWidth, y)
        }
      }

      ctx.stroke()
      break

    case "confetti":
      const confettiSize = 5
      const confettiCount = 100

      for (let i = 0; i < confettiCount; i++) {
        const randomX = x + Math.random() * width
        const randomY = y + Math.random() * height
        const colorIndex = Math.floor(Math.random() * colors.length)

        ctx.fillStyle = colors[colorIndex] || "#000000"
        ctx.beginPath()
        if (Math.random() > 0.5) {
          ctx.fillRect(randomX, randomY, confettiSize, confettiSize)
        } else {
          ctx.arc(randomX, randomY, confettiSize / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      break

    default:
      break
  }
}

// Function to get font based on aesthetic
export function getFontByAesthetic(aesthetic: string): string {
  switch (aesthetic) {
    case "playful-modern":
      return "Poppins, sans-serif"
    case "elegant-minimalist":
      return "Playfair Display, serif"
    case "retro-vibes":
      return "Courier New, monospace"
    case "corporate-clean":
      return "Arial, sans-serif"
    case "grunge-edgy":
      return "Impact, sans-serif"
    case "youthful-vibrant":
      return "Comic Sans MS, cursive"
    case "luxury":
      return "Didot, serif"
    case "tech":
      return "Roboto Mono, monospace"
    case "nature-inspired":
      return "Verdana, sans-serif"
    case "artistic":
      return "Brush Script MT, cursive"
    default:
      return "system-ui, sans-serif"
  }
}

// Function to get preset decorative elements based on aesthetic
export function getDecorativeElements(aesthetic: string) {
  switch (aesthetic) {
    case "playful-modern":
      return ["circles", "dots"]
    case "elegant-minimalist":
      return ["lines", "subtle-gradient"]
    case "retro-vibes":
      return ["halftone", "rectangles"]
    case "corporate-clean":
      return ["grid", "subtle-gradient"]
    case "grunge-edgy":
      return ["splatter", "scratches"]
    case "youthful-vibrant":
      return ["confetti", "stars"]
    case "luxury":
      return ["gold-accents", "lines"]
    case "tech":
      return ["circuit", "grid"]
    case "nature-inspired":
      return ["leaves", "waves"]
    case "artistic":
      return ["brush-strokes", "splatter"]
    default:
      return []
  }
}

// Function to draw decorative elements
export function drawDecorativeElement(
  ctx: CanvasRenderingContext2D,
  element: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
) {
  switch (element) {
    case "circles":
      const circleCount = 5
      const maxRadius = Math.min(width, height) / 10

      for (let i = 0; i < circleCount; i++) {
        const radius = Math.random() * maxRadius + 5
        const circleX = x + Math.random() * (width - radius * 2) + radius
        const circleY = y + Math.random() * (height - radius * 2) + radius

        ctx.globalAlpha = 0.2
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(circleX, circleY, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      break

    case "lines":
      const lineCount = 3
      const lineSpacing = height / (lineCount + 1)

      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3

      for (let i = 1; i <= lineCount; i++) {
        const lineY = y + lineSpacing * i

        ctx.beginPath()
        ctx.moveTo(x, lineY)
        ctx.lineTo(x + width, lineY)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      break

    case "halftone":
      const dotSize = 2
      const dotSpacing = 10

      ctx.fillStyle = color
      ctx.globalAlpha = 0.3

      for (let i = x; i < x + width; i += dotSpacing) {
        for (let j = y; j < y + height; j += dotSpacing) {
          const distance = Math.sqrt(Math.pow(i - (x + width / 2), 2) + Math.pow(j - (y + height / 2), 2))

          const maxDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2))
          const sizeMultiplier = 1 - distance / maxDistance

          ctx.beginPath()
          ctx.arc(i, j, dotSize * sizeMultiplier, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      break

    case "rectangles":
      const rectCount = 10

      ctx.fillStyle = color
      ctx.globalAlpha = 0.2

      for (let i = 0; i < rectCount; i++) {
        const rectWidth = Math.random() * (width / 5) + 10
        const rectHeight = Math.random() * (height / 5) + 10
        const rectX = x + Math.random() * (width - rectWidth)
        const rectY = y + Math.random() * (height - rectHeight)

        ctx.fillRect(rectX, rectY, rectWidth, rectHeight)
      }

      ctx.globalAlpha = 1
      break

    case "stars":
      const starCount = 15

      ctx.fillStyle = color
      ctx.globalAlpha = 0.5

      for (let i = 0; i < starCount; i++) {
        const starX = x + Math.random() * width
        const starY = y + Math.random() * height
        const size = Math.random() * 10 + 5

        drawStar(ctx, starX, starY, 5, size, size / 2)
      }

      ctx.globalAlpha = 1
      break

    case "waves":
      const waveCount = 3
      const waveHeight = height / (waveCount * 2)

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.3

      for (let j = 1; j <= waveCount; j++) {
        const baseY = y + height * (j / (waveCount + 1))

        ctx.beginPath()
        ctx.moveTo(x, baseY)

        for (let i = 0; i <= width; i += 10) {
          const waveY = baseY + Math.sin(i * 0.05) * waveHeight
          ctx.lineTo(x + i, waveY)
        }

        ctx.stroke()
      }

      ctx.globalAlpha = 1
      break

    case "circuit":
      const lineWidth = 2
      const gridSize = 30

      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.globalAlpha = 0.2

      // Draw horizontal and vertical lines with random connections
      for (let i = x; i < x + width; i += gridSize) {
        for (let j = y; j < y + height; j += gridSize) {
          if (Math.random() > 0.7) {
            // Horizontal line
            ctx.beginPath()
            ctx.moveTo(i, j)
            ctx.lineTo(i + gridSize, j)
            ctx.stroke()
          }

          if (Math.random() > 0.7) {
            // Vertical line
            ctx.beginPath()
            ctx.moveTo(i, j)
            ctx.lineTo(i, j + gridSize)
            ctx.stroke()
          }

          if (Math.random() > 0.9) {
            // Circle node
            ctx.beginPath()
            ctx.arc(i, j, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      ctx.globalAlpha = 1
      break

    case "gold-accents":
      // Gold color gradient
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
      gradient.addColorStop(0, "#BF953F")
      gradient.addColorStop(0.5, "#FCF6BA")
      gradient.addColorStop(1, "#B38728")

      // Draw gold frame
      ctx.strokeStyle = gradient
      ctx.lineWidth = 3

      ctx.beginPath()
      roundRect(ctx, x + 10, y + 10, width - 20, height - 20, 5)
      ctx.stroke()

      // Draw corner accents
      const cornerSize = 15

      // Top left
      ctx.beginPath()
      ctx.moveTo(x, y + cornerSize)
      ctx.lineTo(x, y)
      ctx.lineTo(x + cornerSize, y)
      ctx.stroke()

      // Top right
      ctx.beginPath()
      ctx.moveTo(x + width - cornerSize, y)
      ctx.lineTo(x + width, y)
      ctx.lineTo(x + width, y + cornerSize)
      ctx.stroke()

      // Bottom right
      ctx.beginPath()
      ctx.moveTo(x + width, y + height - cornerSize)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x + width - cornerSize, y + height)
      ctx.stroke()

      // Bottom left
      ctx.beginPath()
      ctx.moveTo(x + cornerSize, y + height)
      ctx.lineTo(x, y + height)
      ctx.lineTo(x, y + height - cornerSize)
      ctx.stroke()
      break

    default:
      break
  }
}

// Helper function to draw a star
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
) {
  let rot = (Math.PI / 2) * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }

  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}

// Define poster size dimensions
export const posterSizes = {
  "instagram-post": { width: 1080, height: 1080 },
  "facebook-cover": { width: 820, height: 312 },
  "a4-printable": { width: 595, height: 842 }, // A4 at 72 DPI
  story: { width: 1080, height: 1920 },
  "twitter-header": { width: 1500, height: 500 },
  "youtube-thumbnail": { width: 1280, height: 720 },
}

// Generate dominant color from an image
export async function getDominantColor(image: HTMLImageElement): Promise<string> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return "#000000"

  const size = 10 // Small size for sampling
  canvas.width = size
  canvas.height = size

  ctx.drawImage(image, 0, 0, size, size)
  const imageData = ctx.getImageData(0, 0, size, size).data

  let r = 0,
    g = 0,
    b = 0
  const pixelCount = size * size

  for (let i = 0; i < imageData.length; i += 4) {
    r += imageData[i]
    g += imageData[i + 1]
    b += imageData[i + 2]
  }

  r = Math.floor(r / pixelCount)
  g = Math.floor(g / pixelCount)
  b = Math.floor(b / pixelCount)

  return `rgb(${r}, ${g}, ${b})`
}
