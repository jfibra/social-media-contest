// Types for the canvas editor

// Base element type
export interface BaseElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked: boolean
  visible: boolean
  zIndex: number
}

// Text element
export interface TextElement extends BaseElement {
  type: "text"
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: string
  textAlign: "left" | "center" | "right"
  color: string
  backgroundColor?: string
  padding: number
  lineHeight: number
  letterSpacing: number
  underline: boolean
  strike: boolean
}

// Image element
export interface ImageElement extends BaseElement {
  type: "image"
  src: string
  objectFit: "cover" | "contain" | "fill"
  cropSettings?: {
    x: number
    y: number
    width: number
    height: number
  }
  filter?: string
  borderRadius?: number
}

// Shape element
export interface ShapeElement extends BaseElement {
  type: "shape"
  shapeType: "rectangle" | "circle" | "triangle" | "line" | "polygon" | "star"
  backgroundColor: string
  borderColor?: string
  borderWidth?: number
  borderStyle?: string
  borderRadius?: number
  points?: number[][]
}

// Decorative element
export interface DecorativeElement extends BaseElement {
  type: "decorative"
  decorationType: string
  color: string
  secondaryColor?: string
  pattern?: string
  density?: number
}

// Background element
export interface BackgroundElement extends BaseElement {
  type: "background"
  backgroundColor?: string
  backgroundImage?: string
  backgroundGradient?: {
    type: "linear" | "radial"
    colors: Array<{
      color: string
      position: number
    }>
    angle?: number
  }
  pattern?: string
  patternColor?: string
  opacity: number
}

// Union type for all element types
export type CanvasElement = TextElement | ImageElement | ShapeElement | DecorativeElement | BackgroundElement

// Canvas state
export interface CanvasState {
  width: number
  height: number
  elements: CanvasElement[]
  selectedElementIds: string[]
  zoom: number
  panOffset: { x: number; y: number }
  history: {
    past: CanvasState[]
    future: CanvasState[]
  }
}

// Selection box
export interface SelectionBox {
  x: number
  y: number
  width: number
  height: number
}

// Transform handle positions
export enum TransformHandle {
  TopLeft = "topLeft",
  TopCenter = "topCenter",
  TopRight = "topRight",
  MiddleLeft = "middleLeft",
  MiddleRight = "middleRight",
  BottomLeft = "bottomLeft",
  BottomCenter = "bottomCenter",
  BottomRight = "bottomRight",
  Rotation = "rotation",
}

// Editor mode
export enum EditorMode {
  Select = "select",
  Text = "text",
  Shape = "shape",
  Image = "image",
  Draw = "draw",
  Pan = "pan",
}

// Editor action types
export enum ActionType {
  AddElement = "addElement",
  UpdateElement = "updateElement",
  DeleteElement = "deleteElement",
  SelectElement = "selectElement",
  ClearSelection = "clearSelection",
  MoveElement = "moveElement",
  ResizeElement = "resizeElement",
  RotateElement = "rotateElement",
  BringForward = "bringForward",
  SendBackward = "sendBackward",
  BringToFront = "bringToFront",
  SendToBack = "sendToBack",
  GroupElements = "groupElements",
  UngroupElements = "ungroupElements",
  SetZoom = "setZoom",
  SetPan = "setPan",
  Undo = "undo",
  Redo = "redo",
}

// Editor action
export type EditorAction =
  | { type: ActionType.AddElement; element: CanvasElement }
  | { type: ActionType.UpdateElement; id: string; changes: Partial<CanvasElement> }
  | { type: ActionType.DeleteElement; ids: string[] }
  | { type: ActionType.SelectElement; ids: string[] }
  | { type: ActionType.ClearSelection }
  | { type: ActionType.MoveElement; ids: string[]; dx: number; dy: number }
  | { type: ActionType.ResizeElement; id: string; width: number; height: number; x: number; y: number }
  | { type: ActionType.RotateElement; id: string; rotation: number }
  | { type: ActionType.BringForward; id: string }
  | { type: ActionType.SendBackward; id: string }
  | { type: ActionType.BringToFront; id: string }
  | { type: ActionType.SendToBack; id: string }
  | { type: ActionType.GroupElements; ids: string[] }
  | { type: ActionType.UngroupElements; groupId: string }
  | { type: ActionType.SetZoom; zoom: number }
  | { type: ActionType.SetPan; x: number; y: number }
  | { type: ActionType.Undo }
  | { type: ActionType.Redo }
