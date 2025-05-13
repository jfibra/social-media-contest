"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Move, Type, ImageIcon, Square, Undo, Redo, ZoomIn, ZoomOut } from "lucide-react"

interface EditorElement {
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

interface CanvasEditorProps {
  width: number
  height: number
  initialElements: EditorElement[]
  onSave?: (dataUrl: string) => void
}

export function CanvasEditor({ width, height, initialElements, onSave }: CanvasEditorProps) {
  const [elements, setElements] = useState<EditorElement[]>(initialElements)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [textValue, setTextValue] = useState("")
  const [history, setHistory] = useState<EditorElement[][]>([initialElements])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [tool, setTool] = useState<"select" | "text" | "image" | "shape">("select")

  const canvasRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Save current state to history when elements change
  useEffect(() => {
    if (elements !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...elements])
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [elements])

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(history[historyIndex - 1])
    }
  }

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(history[historyIndex + 1])
    }
  }

  // Handle element selection
  const handleElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedId(id)
  }

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedId(null)

    if (tool !== "select") {
      // Add new element based on selected tool
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      const centerX = canvasRect.width / 2 / zoom
      const centerY = canvasRect.height / 2 / zoom

      if (tool === "text") {
        const newElement: EditorElement = {
          id: `text-${Date.now()}`,
          type: "text",
          x: centerX - 100,
          y: centerY - 25,
          width: 200,
          height: 50,
          content: "Double-click to edit text",
          fontSize: 16,
          fontFamily: "Arial, sans-serif",
          color: "#000000",
        }
        setElements([...elements, newElement])
        setSelectedId(newElement.id)
      } else if (tool === "shape") {
        const newElement: EditorElement = {
          id: `shape-${Date.now()}`,
          type: "shape",
          x: centerX - 50,
          y: centerY - 50,
          width: 100,
          height: 100,
          color: "#3b82f6",
        }
        setElements([...elements, newElement])
        setSelectedId(newElement.id)
      }

      // Reset tool to select after adding element
      setTool("select")
    }
  }

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (selectedId !== id) {
      setSelectedId(id)
    }

    const element = elements.find((el) => el.id === id)
    if (!element) return

    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height })
  }

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation()

    const element = elements.find((el) => el.id === id)
    if (!element) return

    setIsResizing(true)
    setResizeHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
    setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height })
  }

  // Handle mouse move (for dragging and resizing)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return

      const dx = (e.clientX - dragStart.x) / zoom
      const dy = (e.clientY - dragStart.y) / zoom

      if (isDragging && selectedId) {
        setElements(
          elements.map((el) => (el.id === selectedId ? { ...el, x: elementStart.x + dx, y: elementStart.y + dy } : el)),
        )
      } else if (isResizing && selectedId && resizeHandle) {
        const element = elements.find((el) => el.id === selectedId)
        if (!element) return

        let newWidth = elementStart.width
        let newHeight = elementStart.height
        let newX = elementStart.x
        let newY = elementStart.y

        // Handle different resize handles
        switch (resizeHandle) {
          case "top-left":
            newWidth = elementStart.width - dx
            newHeight = elementStart.height - dy
            newX = elementStart.x + dx
            newY = elementStart.y + dy
            break
          case "top-right":
            newWidth = elementStart.width + dx
            newHeight = elementStart.height - dy
            newY = elementStart.y + dy
            break
          case "bottom-left":
            newWidth = elementStart.width - dx
            newHeight = elementStart.height + dy
            newX = elementStart.x + dx
            break
          case "bottom-right":
            newWidth = elementStart.width + dx
            newHeight = elementStart.height + dy
            break
        }

        // Ensure minimum size
        newWidth = Math.max(20, newWidth)
        newHeight = Math.max(20, newHeight)

        setElements(
          elements.map((el) =>
            el.id === selectedId ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight } : el,
          ),
        )
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeHandle(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, elementStart, selectedId, resizeHandle, elements, zoom])

  // Handle text editing
  const handleTextDoubleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    const element = elements.find((el) => el.id === id)
    if (!element || element.type !== "text") return

    setEditingTextId(id)
    setTextValue(element.content || "")

    // Focus the textarea in the next tick
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 0)
  }

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value)
  }

  // Handle text edit complete
  const handleTextEditComplete = () => {
    if (editingTextId) {
      setElements(elements.map((el) => (el.id === editingTextId ? { ...el, content: textValue } : el)))
    }

    setEditingTextId(null)
    setTextValue("")
  }

  // Handle element deletion
  const handleDeleteElement = () => {
    if (selectedId) {
      setElements(elements.filter((el) => el.id !== selectedId))
      setSelectedId(null)
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if editing text
      if (editingTextId) return

      // Delete selected element
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        handleDeleteElement()
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          if (e.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
          e.preventDefault()
        } else if (e.key === "y") {
          handleRedo()
          e.preventDefault()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedId, editingTextId])

  // Export canvas as image
  const handleExport = () => {
    if (!canvasRef.current) return

    // Create a canvas element
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Sort elements by z-index (we'll use array index as z-index)
    const sortedElements = [...elements].sort((a, b) => {
      // Background elements should be at the bottom
      if (a.type === "background") return -1
      if (b.type === "background") return 1
      return 0
    })

    // Draw each element
    const drawElements = async () => {
      for (const element of sortedElements) {
        if (element.type === "background") {
          // Draw background
          ctx.fillStyle = element.color || "#ffffff"
          ctx.fillRect(0, 0, width, height)
        } else if (element.type === "shape") {
          // Draw shape
          ctx.fillStyle = element.color || "#000000"
          ctx.fillRect(element.x, element.y, element.width, element.height)
        } else if (element.type === "text") {
          // Draw text
          ctx.font = `${element.fontSize || 16}px ${element.fontFamily || "Arial, sans-serif"}`
          ctx.fillStyle = element.color || "#000000"
          ctx.fillText(element.content || "", element.x, element.y + (element.fontSize || 16))
        } else if (element.type === "image" && element.src) {
          // Draw image
          try {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = element.src
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
            })
            ctx.drawImage(img, element.x, element.y, element.width, element.height)
          } catch (error) {
            console.error("Error loading image:", error)
          }
        }
      }

      // Get data URL and call onSave callback
      const dataUrl = canvas.toDataURL("image/png")
      if (onSave) {
        onSave(dataUrl)
      }

      // Create download link
      const link = document.createElement("a")
      link.download = "poster.png"
      link.href = dataUrl
      link.click()
    }

    drawElements()
  }

  // Render resize handles for selected element
  const renderResizeHandles = (element: EditorElement) => {
    if (element.id !== selectedId) return null

    const handleSize = 8 / zoom

    return (
      <>
        <div
          className="absolute bg-blue-500 border border-white rounded-full cursor-nwse-resize"
          style={{
            top: -handleSize / 2,
            left: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleResizeStart(e, element.id, "top-left")}
        />
        <div
          className="absolute bg-blue-500 border border-white rounded-full cursor-nesw-resize"
          style={{
            top: -handleSize / 2,
            right: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleResizeStart(e, element.id, "top-right")}
        />
        <div
          className="absolute bg-blue-500 border border-white rounded-full cursor-nesw-resize"
          style={{
            bottom: -handleSize / 2,
            left: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleResizeStart(e, element.id, "bottom-left")}
        />
        <div
          className="absolute bg-blue-500 border border-white rounded-full cursor-nwse-resize"
          style={{
            bottom: -handleSize / 2,
            right: -handleSize / 2,
            width: handleSize,
            height: handleSize,
          }}
          onMouseDown={(e) => handleResizeStart(e, element.id, "bottom-right")}
        />
      </>
    )
  }

  // Render element based on type
  const renderElement = (element: EditorElement) => {
    const isSelected = element.id === selectedId

    const elementStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      border: isSelected ? "1px solid #3b82f6" : "1px solid transparent",
      cursor: "move",
      ...element.style,
    }

    if (element.type === "background") {
      return (
        <div
          key={element.id}
          style={{
            ...elementStyle,
            backgroundColor: element.color || "#ffffff",
            cursor: "default",
            border: "none",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
          }}
          onClick={(e) => handleElementClick(e, element.id)}
        />
      )
    }

    if (element.type === "text") {
      return (
        <div
          key={element.id}
          style={{
            ...elementStyle,
            color: element.color || "#000000",
            fontFamily: element.fontFamily || "Arial, sans-serif",
            fontSize: `${element.fontSize || 16}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
          onClick={(e) => handleElementClick(e, element.id)}
          onMouseDown={(e) => handleDragStart(e, element.id)}
          onDoubleClick={(e) => handleTextDoubleClick(e, element.id)}
        >
          {element.id === editingTextId ? (
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={handleTextChange}
              onBlur={handleTextEditComplete}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "transparent",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: "inherit",
                resize: "none",
                outline: "none",
                textAlign: "center",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleTextEditComplete()
                }
              }}
            />
          ) : (
            element.content
          )}
          {renderResizeHandles(element)}
        </div>
      )
    }

    if (element.type === "shape") {
      return (
        <div
          key={element.id}
          style={{
            ...elementStyle,
            backgroundColor: element.color || "#3b82f6",
          }}
          onClick={(e) => handleElementClick(e, element.id)}
          onMouseDown={(e) => handleDragStart(e, element.id)}
        >
          {renderResizeHandles(element)}
        </div>
      )
    }

    if (element.type === "image" && element.src) {
      return (
        <div
          key={element.id}
          style={elementStyle}
          onClick={(e) => handleElementClick(e, element.id)}
          onMouseDown={(e) => handleDragStart(e, element.id)}
        >
          <img
            src={element.src || "/placeholder.svg"}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            draggable={false}
          />
          {renderResizeHandles(element)}
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex justify-between p-2 bg-gray-100 border-b">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={tool === "select" ? "default" : "outline"}
            onClick={() => setTool("select")}
            title="Select Tool"
          >
            <Move className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={tool === "text" ? "default" : "outline"}
            onClick={() => setTool("text")}
            title="Text Tool"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={tool === "shape" ? "default" : "outline"}
            onClick={() => setTool("shape")}
            title="Shape Tool"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={tool === "image" ? "default" : "outline"}
            onClick={() => setTool("image")}
            title="Image Tool"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-2 text-sm">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => setZoom(zoom + 0.1)} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button size="sm" onClick={handleExport} className="bg-realty-primary hover:bg-realty-primary/90">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Canvas */}
      <div
        className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-8"
        style={{ minHeight: "500px" }}
      >
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg"
          style={{
            width: `${width * zoom}px`,
            height: `${height * zoom}px`,
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          onClick={handleCanvasClick}
        >
          {elements.map(renderElement)}
        </div>
      </div>

      {/* Properties panel (simplified) */}
      {selectedId && (
        <div className="p-4 border-t bg-gray-50">
          <h3 className="font-medium mb-2">Element Properties</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="destructive" onClick={handleDeleteElement}>
              Delete Element
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
