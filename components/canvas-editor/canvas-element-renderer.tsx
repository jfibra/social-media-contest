"use client"

import type React from "react"
import {
  type CanvasElement,
  type TextElement,
  type ImageElement,
  type ShapeElement,
  type DecorativeElement,
  type BackgroundElement,
  TransformHandle,
} from "./editor-types"

interface ElementRendererProps {
  element: CanvasElement
  isSelected: boolean
  zoom: number
  onSelect: (id: string, event: React.MouseEvent) => void
  onDoubleClick?: (id: string, event: React.MouseEvent) => void
  onDragStart?: (id: string, event: React.MouseEvent) => void
  onTransformStart?: (id: string, handle: TransformHandle, event: React.MouseEvent) => void
}

export const CanvasElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  zoom,
  onSelect,
  onDoubleClick,
  onDragStart,
  onTransformStart,
}) => {
  // Common element style
  const getElementStyle = (element: CanvasElement): React.CSSProperties => {
    return {
      position: "absolute",
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      visibility: element.visible ? "visible" : "hidden",
      zIndex: element.zIndex,
      pointerEvents: element.locked ? "none" : "auto",
      cursor: "move",
    }
  }

  // Render transform handles when element is selected
  const renderTransformHandles = () => {
    if (!isSelected) return null

    const handleSize = 8 / zoom
    const handleStyle: React.CSSProperties = {
      position: "absolute",
      width: `${handleSize}px`,
      height: `${handleSize}px`,
      backgroundColor: "#1a73e8",
      border: "1px solid white",
      borderRadius: "50%",
    }

    const rotationHandleStyle: React.CSSProperties = {
      position: "absolute",
      width: `${handleSize}px`,
      height: `${handleSize}px`,
      backgroundColor: "#1a73e8",
      border: "1px solid white",
      borderRadius: "50%",
      top: `-${20 / zoom}px`,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "grab",
    }

    return (
      <>
        {/* Corner handles */}
        <div
          style={{ ...handleStyle, top: "-4px", left: "-4px", cursor: "nwse-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.TopLeft, e)}
        />
        <div
          style={{ ...handleStyle, top: "-4px", right: "-4px", cursor: "nesw-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.TopRight, e)}
        />
        <div
          style={{ ...handleStyle, bottom: "-4px", left: "-4px", cursor: "nesw-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.BottomLeft, e)}
        />
        <div
          style={{ ...handleStyle, bottom: "-4px", right: "-4px", cursor: "nwse-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.BottomRight, e)}
        />

        {/* Middle handles */}
        <div
          style={{ ...handleStyle, top: "-4px", left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.TopCenter, e)}
        />
        <div
          style={{ ...handleStyle, bottom: "-4px", left: "50%", transform: "translateX(-50%)", cursor: "ns-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.BottomCenter, e)}
        />
        <div
          style={{ ...handleStyle, top: "50%", left: "-4px", transform: "translateY(-50%)", cursor: "ew-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.MiddleLeft, e)}
        />
        <div
          style={{ ...handleStyle, top: "50%", right: "-4px", transform: "translateY(-50%)", cursor: "ew-resize" }}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.MiddleRight, e)}
        />

        {/* Rotation handle */}
        <div
          style={rotationHandleStyle}
          onMouseDown={(e) => onTransformStart?.(element.id, TransformHandle.Rotation, e)}
        />
      </>
    )
  }

  // Render text element
  const renderTextElement = (element: TextElement) => {
    const textStyle: React.CSSProperties = {
      ...getElementStyle(element),
      fontFamily: element.fontFamily,
      fontSize: `${element.fontSize}px`,
      fontWeight: element.fontWeight,
      fontStyle: element.fontStyle,
      textAlign: element.textAlign,
      color: element.color,
      backgroundColor: element.backgroundColor || "transparent",
      padding: `${element.padding}px`,
      lineHeight: `${element.lineHeight}`,
      letterSpacing: `${element.letterSpacing}px`,
      textDecoration: `${element.underline ? "underline" : ""} ${element.strike ? "line-through" : ""}`.trim(),
      whiteSpace: "pre-wrap",
      overflow: "hidden",
      userSelect: "none",
    }

    return (
      <div
        style={textStyle}
        onClick={(e) => onSelect(element.id, e)}
        onDoubleClick={(e) => onDoubleClick?.(element.id, e)}
        onMouseDown={(e) => onDragStart?.(element.id, e)}
      >
        {element.text}
        {renderTransformHandles()}
      </div>
    )
  }

  // Render image element
  const renderImageElement = (element: ImageElement) => {
    const imageStyle: React.CSSProperties = {
      ...getElementStyle(element),
      objectFit: element.objectFit,
      filter: element.filter,
      borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
      overflow: "hidden",
    }

    return (
      <div
        style={{
          ...getElementStyle(element),
          overflow: "hidden",
          borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
        }}
        onClick={(e) => onSelect(element.id, e)}
        onMouseDown={(e) => onDragStart?.(element.id, e)}
      >
        <img
          src={element.src || "/placeholder.svg"}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: element.objectFit,
            filter: element.filter,
          }}
          draggable={false}
        />
        {renderTransformHandles()}
      </div>
    )
  }

  // Render shape element
  const renderShapeElement = (element: ShapeElement) => {
    const shapeStyle: React.CSSProperties = {
      ...getElementStyle(element),
      backgroundColor: element.backgroundColor,
      border: element.borderWidth
        ? `${element.borderWidth}px ${element.borderStyle || "solid"} ${element.borderColor || "black"}`
        : undefined,
      borderRadius:
        element.shapeType === "circle" ? "50%" : element.borderRadius ? `${element.borderRadius}px` : undefined,
    }

    // For triangle shape
    if (element.shapeType === "triangle") {
      return (
        <div
          style={{
            ...getElementStyle(element),
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
          onClick={(e) => onSelect(element.id, e)}
          onMouseDown={(e) => onDragStart?.(element.id, e)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              backgroundColor: element.backgroundColor,
              border: element.borderWidth
                ? `${element.borderWidth}px ${element.borderStyle || "solid"} ${element.borderColor || "black"}`
                : undefined,
            }}
          />
          {renderTransformHandles()}
        </div>
      )
    }

    // For star shape
    if (element.shapeType === "star") {
      return (
        <div
          style={{
            ...getElementStyle(element),
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
          onClick={(e) => onSelect(element.id, e)}
          onMouseDown={(e) => onDragStart?.(element.id, e)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              backgroundColor: element.backgroundColor,
              border: element.borderWidth
                ? `${element.borderWidth}px ${element.borderStyle || "solid"} ${element.borderColor || "black"}`
                : undefined,
            }}
          />
          {renderTransformHandles()}
        </div>
      )
    }

    // For polygon shape
    if (element.shapeType === "polygon" && element.points) {
      const pointsString = element.points.map((point) => `${point[0]}% ${point[1]}%`).join(", ")

      return (
        <div
          style={{
            ...getElementStyle(element),
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
          onClick={(e) => onSelect(element.id, e)}
          onMouseDown={(e) => onDragStart?.(element.id, e)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              clipPath: `polygon(${pointsString})`,
              backgroundColor: element.backgroundColor,
              border: element.borderWidth
                ? `${element.borderWidth}px ${element.borderStyle || "solid"} ${element.borderColor || "black"}`
                : undefined,
            }}
          />
          {renderTransformHandles()}
        </div>
      )
    }

    // For line shape
    if (element.shapeType === "line") {
      return (
        <div
          style={{
            ...getElementStyle(element),
            backgroundColor: "transparent",
          }}
          onClick={(e) => onSelect(element.id, e)}
          onMouseDown={(e) => onDragStart?.(element.id, e)}
        >
          <div
            style={{
              width: "100%",
              height: `${element.borderWidth || 2}px`,
              backgroundColor: element.borderColor || element.backgroundColor,
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          {renderTransformHandles()}
        </div>
      )
    }

    // Default rectangle or circle
    return (
      <div
        style={shapeStyle}
        onClick={(e) => onSelect(element.id, e)}
        onMouseDown={(e) => onDragStart?.(element.id, e)}
      >
        {renderTransformHandles()}
      </div>
    )
  }

  // Render decorative element
  const renderDecorativeElement = (element: DecorativeElement) => {
    // This is a placeholder for decorative elements
    // In a real implementation, you would render SVG patterns or other decorative elements
    return (
      <div
        style={{
          ...getElementStyle(element),
          backgroundColor: "rgba(0,0,0,0.1)",
          backgroundImage: `repeating-linear-gradient(45deg, ${element.color}, ${element.color} 10px, transparent 10px, transparent 20px)`,
        }}
        onClick={(e) => onSelect(element.id, e)}
        onMouseDown={(e) => onDragStart?.(element.id, e)}
      >
        {renderTransformHandles()}
      </div>
    )
  }

  // Render background element
  const renderBackgroundElement = (element: BackgroundElement) => {
    const backgroundStyle: React.CSSProperties = {
      ...getElementStyle(element),
      backgroundColor: element.backgroundColor || "transparent",
    }

    if (element.backgroundImage) {
      backgroundStyle.backgroundImage = `url(${element.backgroundImage})`
      backgroundStyle.backgroundSize = "cover"
      backgroundStyle.backgroundPosition = "center"
    } else if (element.backgroundGradient) {
      const { type, colors, angle = 0 } = element.backgroundGradient

      const colorStops = colors.map((stop) => `${stop.color} ${stop.position * 100}%`).join(", ")

      if (type === "linear") {
        backgroundStyle.backgroundImage = `linear-gradient(${angle}deg, ${colorStops})`
      } else if (type === "radial") {
        backgroundStyle.backgroundImage = `radial-gradient(circle, ${colorStops})`
      }
    } else if (element.pattern) {
      // Apply pattern based on pattern type
      switch (element.pattern) {
        case "dots":
          backgroundStyle.backgroundImage = `radial-gradient(${element.patternColor || "#000"} 1px, transparent 1px)`
          backgroundStyle.backgroundSize = "10px 10px"
          break
        case "stripes":
          backgroundStyle.backgroundImage = `repeating-linear-gradient(45deg, ${element.patternColor || "#000"}, ${element.patternColor || "#000"} 1px, transparent 1px, transparent 10px)`
          break
        case "grid":
          backgroundStyle.backgroundImage = `linear-gradient(to right, ${element.patternColor || "#000"} 1px, transparent 1px), linear-gradient(to bottom, ${element.patternColor || "#000"} 1px, transparent 1px)`
          backgroundStyle.backgroundSize = "20px 20px"
          break
        default:
          break
      }
    }

    return (
      <div
        style={backgroundStyle}
        onClick={(e) => onSelect(element.id, e)}
        onMouseDown={(e) => onDragStart?.(element.id, e)}
      >
        {renderTransformHandles()}
      </div>
    )
  }

  // Render element based on type
  switch (element.type) {
    case "text":
      return renderTextElement(element as TextElement)
    case "image":
      return renderImageElement(element as ImageElement)
    case "shape":
      return renderShapeElement(element as ShapeElement)
    case "decorative":
      return renderDecorativeElement(element as DecorativeElement)
    case "background":
      return renderBackgroundElement(element as BackgroundElement)
    default:
      return null
  }
}
