"use client"

import type React from "react"
import { useReducer, useRef, useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  type CanvasState,
  type CanvasElement,
  type TextElement,
  type ShapeElement,
  EditorMode,
  ActionType,
  TransformHandle,
} from "./editor-types"
import { canvasReducer, initialCanvasState } from "./editor-reducer"
import { CanvasElementRenderer } from "./canvas-element-renderer"

interface CanvasEditorProps {
  width: number
  height: number
  initialElements?: CanvasElement[]
  onCanvasChange?: (state: CanvasState) => void
  className?: string
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  width,
  height,
  initialElements = [],
  onCanvasChange,
  className = "",
}) => {
  // Initialize state with provided dimensions and elements
  const [state, dispatch] = useReducer(canvasReducer, {
    ...initialCanvasState,
    width,
    height,
    elements: initialElements,
  })

  // Refs for canvas interaction
  const canvasRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartPosRef = useRef({ x: 0, y: 0 })
  const dragElementStartPosRef = useRef({ x: 0, y: 0 })
  const dragElementIdRef = useRef<string | null>(null)
  const transformHandleRef = useRef<TransformHandle | null>(null)
  const transformElementStartRef = useRef<{
    width: number
    height: number
    x: number
    y: number
    rotation: number
  } | null>(null)
  const isTransformingRef = useRef(false)
  const transformCenterRef = useRef({ x: 0, y: 0 })

  // Editor state
  const [editorMode, setEditorMode] = useState<EditorMode>(EditorMode.Select)
  const [isTextEditing, setIsTextEditing] = useState(false)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [textInputValue, setTextInputValue] = useState("")

  // Notify parent component of canvas changes
  useEffect(() => {
    onCanvasChange?.(state)
  }, [state, onCanvasChange])

  // Handle mouse down on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      // Clear selection when clicking on empty canvas
      dispatch({ type: ActionType.ClearSelection })

      if (editorMode === EditorMode.Text) {
        // Create new text element when in text mode
        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / state.zoom - state.panOffset.x
        const y = (e.clientY - rect.top) / state.zoom - state.panOffset.y

        const newTextElement: TextElement = {
          id: uuidv4(),
          type: "text",
          x,
          y,
          width: 200,
          height: 50,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 1,
          text: "Double-click to edit text",
          fontSize: 16,
          fontFamily: "Arial, sans-serif",
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "left",
          color: "#000000",
          padding: 5,
          lineHeight: 1.5,
          letterSpacing: 0,
          underline: false,
          strike: false,
        }

        dispatch({ type: ActionType.AddElement, element: newTextElement })
        setEditorMode(EditorMode.Select) // Switch back to select mode
      } else if (editorMode === EditorMode.Shape) {
        // Create new shape element when in shape mode
        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / state.zoom - state.panOffset.x
        const y = (e.clientY - rect.top) / state.zoom - state.panOffset.y

        const newShapeElement: ShapeElement = {
          id: uuidv4(),
          type: "shape",
          shapeType: "rectangle", // Default shape type
          x,
          y,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
          visible: true,
          zIndex: 1,
          backgroundColor: "#3b82f6",
          borderColor: "#1d4ed8",
          borderWidth: 0,
        }

        dispatch({ type: ActionType.AddElement, element: newShapeElement })
        setEditorMode(EditorMode.Select) // Switch back to select mode
      }
    }
  }

  // Handle element selection
  const handleElementSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // If shift key is pressed, toggle selection
    if (e.shiftKey) {
      const newSelectedIds = state.selectedElementIds.includes(id)
        ? state.selectedElementIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedElementIds, id]

      dispatch({ type: ActionType.SelectElement, ids: newSelectedIds })
    } else {
      // Otherwise, select only this element
      dispatch({ type: ActionType.SelectElement, ids: [id] })
    }
  }

  // Handle element double click (for text editing)
  const handleElementDoubleClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const element = state.elements.find((el) => el.id === id)
    if (element?.type === "text") {
      setIsTextEditing(true)
      setEditingTextId(id)
      setTextInputValue((element as TextElement).text)
    }
  }

  // Handle drag start
  const handleElementDragStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!state.selectedElementIds.includes(id)) {
      dispatch({ type: ActionType.SelectElement, ids: [id] })
    }

    isDraggingRef.current = true
    dragElementIdRef.current = id
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }

    const element = state.elements.find((el) => el.id === id)
    if (element) {
      dragElementStartPosRef.current = { x: element.x, y: element.y }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle transform start
  const handleTransformStart = (id: string, handle: TransformHandle, e: React.MouseEvent) => {
    e.stopPropagation()

    isTransformingRef.current = true
    transformHandleRef.current = handle
    dragElementIdRef.current = id
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }

    const element = state.elements.find((el) => el.id === id)
    if (element) {
      transformElementStartRef.current = {
        width: element.width,
        height: element.height,
        x: element.x,
        y: element.y,
        rotation: element.rotation,
      }

      // Calculate center for rotation
      transformCenterRef.current = {
        x: element.x + element.width / 2,
        y: element.y + element.height / 2,
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle mouse move (for dragging and transforming)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingRef.current && dragElementIdRef.current) {
        const dx = (e.clientX - dragStartPosRef.current.x) / state.zoom
        const dy = (e.clientY - dragStartPosRef.current.y) / state.zoom

        // If multiple elements are selected, move all of them
        if (state.selectedElementIds.includes(dragElementIdRef.current)) {
          dispatch({
            type: ActionType.MoveElement,
            ids: state.selectedElementIds,
            dx,
            dy,
          })
        } else {
          dispatch({
            type: ActionType.MoveElement,
            ids: [dragElementIdRef.current],
            dx,
            dy,
          })
        }

        dragStartPosRef.current = { x: e.clientX, y: e.clientY }
      } else if (
        isTransformingRef.current &&
        dragElementIdRef.current &&
        transformHandleRef.current &&
        transformElementStartRef.current
      ) {
        const dx = (e.clientX - dragStartPosRef.current.x) / state.zoom
        const dy = (e.clientY - dragStartPosRef.current.y) / state.zoom

        const element = state.elements.find((el) => el.id === dragElementIdRef.current)
        if (!element) return

        const { width: startWidth, height: startHeight, x: startX, y: startY } = transformElementStartRef.current

        // Handle rotation
        if (transformHandleRef.current === TransformHandle.Rotation) {
          const center = transformCenterRef.current
          const startAngle = Math.atan2(dragStartPosRef.current.y - center.y, dragStartPosRef.current.x - center.x)
          const currentAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x)

          let rotation = element.rotation + ((currentAngle - startAngle) * 180) / Math.PI

          // Snap to 15 degree increments if shift is pressed
          if (e.shiftKey) {
            rotation = Math.round(rotation / 15) * 15
          }

          dispatch({
            type: ActionType.RotateElement,
            id: dragElementIdRef.current,
            rotation,
          })

          dragStartPosRef.current = { x: e.clientX, y: e.clientY }
          return
        }

        // Handle resizing
        let newWidth = startWidth
        let newHeight = startHeight
        let newX = startX
        let newY = startY

        // Calculate new dimensions based on handle position
        switch (transformHandleRef.current) {
          case TransformHandle.TopLeft:
            newWidth = startWidth - dx
            newHeight = startHeight - dy
            newX = startX + dx
            newY = startY + dy
            break
          case TransformHandle.TopCenter:
            newHeight = startHeight - dy
            newY = startY + dy
            break
          case TransformHandle.TopRight:
            newWidth = startWidth + dx
            newHeight = startHeight - dy
            newY = startY + dy
            break
          case TransformHandle.MiddleLeft:
            newWidth = startWidth - dx
            newX = startX + dx
            break
          case TransformHandle.MiddleRight:
            newWidth = startWidth + dx
            break
          case TransformHandle.BottomLeft:
            newWidth = startWidth - dx
            newHeight = startHeight + dy
            newX = startX + dx
            break
          case TransformHandle.BottomCenter:
            newHeight = startHeight + dy
            break
          case TransformHandle.BottomRight:
            newWidth = startWidth + dx
            newHeight = startHeight + dy
            break
        }

        // Maintain aspect ratio if shift is pressed
        if (e.shiftKey) {
          const aspectRatio = startWidth / startHeight

          switch (transformHandleRef.current) {
            case TransformHandle.TopLeft:
            case TransformHandle.BottomRight:
              if (Math.abs(dx) > Math.abs(dy)) {
                newHeight = newWidth / aspectRatio
                if (transformHandleRef.current === TransformHandle.TopLeft) {
                  newY = startY + startHeight - newHeight
                }
              } else {
                newWidth = newHeight * aspectRatio
                if (transformHandleRef.current === TransformHandle.TopLeft) {
                  newX = startX + startWidth - newWidth
                }
              }
              break
            case TransformHandle.TopRight:
            case TransformHandle.BottomLeft:
              if (Math.abs(dx) > Math.abs(dy)) {
                newHeight = newWidth / aspectRatio
                if (transformHandleRef.current === TransformHandle.TopRight) {
                  newY = startY + startHeight - newHeight
                }
              } else {
                newWidth = newHeight * aspectRatio
                if (transformHandleRef.current === TransformHandle.BottomLeft) {
                  newX = startX + startWidth - newWidth
                }
              }
              break
            case TransformHandle.TopCenter:
            case TransformHandle.BottomCenter:
              newWidth = newHeight * aspectRatio
              break
            case TransformHandle.MiddleLeft:
            case TransformHandle.MiddleRight:
              newHeight = newWidth / aspectRatio
              break
          }
        }

        // Ensure minimum size
        newWidth = Math.max(10, newWidth)
        newHeight = Math.max(10, newHeight)

        dispatch({
          type: ActionType.ResizeElement,
          id: dragElementIdRef.current,
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        })
      }
    },
    [state.zoom, state.selectedElementIds],
  )

  // Handle mouse up (end drag or transform)
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    isTransformingRef.current = false
    dragElementIdRef.current = null
    transformHandleRef.current = null
    transformElementStartRef.current = null

    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }, [handleMouseMove])

  // Handle text editing completion
  const handleTextEditingComplete = () => {
    if (editingTextId && textInputValue !== undefined) {
      dispatch({
        type: ActionType.UpdateElement,
        id: editingTextId,
        changes: { text: textInputValue },
      })
    }

    setIsTextEditing(false)
    setEditingTextId(null)
    setTextInputValue("")
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if text editing is active
      if (isTextEditing) return

      // Delete selected elements
      if ((e.key === "Delete" || e.key === "Backspace") && state.selectedElementIds.length > 0) {
        dispatch({ type: ActionType.DeleteElement, ids: state.selectedElementIds })
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          if (e.shiftKey) {
            dispatch({ type: ActionType.Redo })
          } else {
            dispatch({ type: ActionType.Undo })
          }
          e.preventDefault()
        } else if (e.key === "y") {
          dispatch({ type: ActionType.Redo })
          e.preventDefault()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [state.selectedElementIds, isTextEditing])

  // Render text editing overlay
  const renderTextEditingOverlay = () => {
    if (!isTextEditing || !editingTextId) return null

    const textElement = state.elements.find((el) => el.id === editingTextId) as TextElement
    if (!textElement) return null

    const style: React.CSSProperties = {
      position: "absolute",
      left: `${textElement.x}px`,
      top: `${textElement.y}px`,
      width: `${textElement.width}px`,
      height: `${textElement.height}px`,
      fontFamily: textElement.fontFamily,
      fontSize: `${textElement.fontSize}px`,
      fontWeight: textElement.fontWeight,
      fontStyle: textElement.fontStyle,
      color: textElement.color,
      backgroundColor: textElement.backgroundColor || "transparent",
      padding: `${textElement.padding}px`,
      border: "none",
      outline: "2px solid #1a73e8",
      resize: "none",
      overflow: "hidden",
      zIndex: 9999,
    }

    return (
      <textarea
        value={textInputValue}
        onChange={(e) => setTextInputValue(e.target.value)}
        style={style}
        autoFocus
        onBlur={handleTextEditingComplete}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            handleTextEditingComplete()
          }
        }}
      />
    )
  }

  // Render canvas with elements
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={canvasRef}
        className="relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#f0f0f0",
          transform: `scale(${state.zoom})`,
          transformOrigin: "0 0",
          cursor: editorMode === EditorMode.Select ? "default" : "crosshair",
        }}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Render all elements sorted by z-index */}
        {state.elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <CanvasElementRenderer
              key={element.id}
              element={element}
              isSelected={state.selectedElementIds.includes(element.id)}
              zoom={state.zoom}
              onSelect={handleElementSelect}
              onDoubleClick={handleElementDoubleClick}
              onDragStart={handleElementDragStart}
              onTransformStart={handleTransformStart}
            />
          ))}

        {/* Text editing overlay */}
        {renderTextEditingOverlay()}
      </div>

      {/* Editor toolbar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex space-x-2">
        <button
          className={`p-2 rounded ${editorMode === EditorMode.Select ? "bg-blue-100" : "hover:bg-gray-100"}`}
          onClick={() => setEditorMode(EditorMode.Select)}
          title="Select Tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
          </svg>
        </button>
        <button
          className={`p-2 rounded ${editorMode === EditorMode.Text ? "bg-blue-100" : "hover:bg-gray-100"}`}
          onClick={() => setEditorMode(EditorMode.Text)}
          title="Text Tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
          </svg>
        </button>
        <button
          className={`p-2 rounded ${editorMode === EditorMode.Shape ? "bg-blue-100" : "hover:bg-gray-100"}`}
          onClick={() => setEditorMode(EditorMode.Shape)}
          title="Shape Tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => dispatch({ type: ActionType.Undo })}
          title="Undo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 14 4 9 9 4"></polyline>
            <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
          </svg>
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => dispatch({ type: ActionType.Redo })}
          title="Redo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 14 20 9 15 4"></polyline>
            <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
          </svg>
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => {
            if (state.selectedElementIds.length > 0) {
              dispatch({ type: ActionType.DeleteElement, ids: state.selectedElementIds })
            }
          }}
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex space-x-2">
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => dispatch({ type: ActionType.SetZoom, zoom: Math.max(0.1, state.zoom - 0.1) })}
          title="Zoom Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <span className="flex items-center px-2">{Math.round(state.zoom * 100)}%</span>
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => dispatch({ type: ActionType.SetZoom, zoom: state.zoom + 0.1 })}
          title="Zoom In"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}
