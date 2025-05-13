"use client"

import type React from "react"
import { type CanvasElement, type TextElement, type ImageElement, type ShapeElement, ActionType } from "./editor-types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/color-picker"

interface PropertiesPanelProps {
  selectedElements: CanvasElement[]
  dispatch: (action: any) => void
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedElements, dispatch }) => {
  // If no elements are selected, show empty panel
  if (selectedElements.length === 0) {
    return <div className="p-4 text-center text-gray-500">Select an element to edit its properties</div>
  }

  // If multiple elements are selected, show limited options
  if (selectedElements.length > 1) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-medium">Multiple Elements Selected</h3>

        <div>
          <Label>Opacity</Label>
          <Slider
            defaultValue={[100]}
            min={0}
            max={100}
            step={1}
            className="mt-2"
            onValueChange={(value) => {
              selectedElements.forEach((element) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { opacity: value[0] / 100 },
                })
              })
            }}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => {
              selectedElements.forEach((element) => {
                dispatch({ type: ActionType.BringForward, id: element.id })
              })
            }}
          >
            Bring Forward
          </Button>
          <Button
            size="sm"
            onClick={() => {
              selectedElements.forEach((element) => {
                dispatch({ type: ActionType.SendBackward, id: element.id })
              })
            }}
          >
            Send Backward
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="destructive">
            Delete
          </Button>
        </div>
      </div>
    )
  }

  // Single element selected, show all properties
  const element = selectedElements[0]

  switch (element.type) {
    case "text":
      return (
        <div className="p-4 space-y-4">
          <h3 className="font-medium">Text Properties</h3>
          <div>
            <Label>Text</Label>
            <Input
              type="text"
              value={(element as TextElement).text}
              className="mt-2"
              onChange={(e) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { text: e.target.value },
                })
              }}
            />
          </div>
          <div>
            <Label>Font Size</Label>
            <Slider
              defaultValue={[(element as TextElement).fontSize]}
              min={10}
              max={100}
              step={1}
              className="mt-2"
              onValueChange={(value) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { fontSize: value[0] },
                })
              }}
            />
          </div>
          <div>
            <Label>Color</Label>
            <ColorPicker
              color={(element as TextElement).fill}
              onColorChange={(color) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { fill: color },
                })
              }}
            />
          </div>
          <div>
            <Label>Opacity</Label>
            <Slider
              defaultValue={[element.opacity * 100]}
              min={0}
              max={100}
              step={1}
              className="mt-2"
              onValueChange={(value) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { opacity: value[0] / 100 },
                })
              }}
            />
          </div>
        </div>
      )
    case "image":
      return (
        <div className="p-4 space-y-4">
          <h3 className="font-medium">Image Properties</h3>
          <div>
            <Label>Width</Label>
            <Input
              type="number"
              value={(element as ImageElement).width.toString()}
              className="mt-2"
              onChange={(e) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { width: Number.parseInt(e.target.value) },
                })
              }}
            />
          </div>
          <div>
            <Label>Height</Label>
            <Input
              type="number"
              value={(element as ImageElement).height.toString()}
              className="mt-2"
              onChange={(e) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { height: Number.parseInt(e.target.value) },
                })
              }}
            />
          </div>
          <div>
            <Label>Opacity</Label>
            <Slider
              defaultValue={[element.opacity * 100]}
              min={0}
              max={100}
              step={1}
              className="mt-2"
              onValueChange={(value) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { opacity: value[0] / 100 },
                })
              }}
            />
          </div>
        </div>
      )
    case "shape":
      return (
        <div className="p-4 space-y-4">
          <h3 className="font-medium">Shape Properties</h3>
          <div>
            <Label>Width</Label>
            <Input
              type="number"
              value={(element as ShapeElement).width.toString()}
              className="mt-2"
              onChange={(e) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { width: Number.parseInt(e.target.value) },
                })
              }}
            />
          </div>
          <div>
            <Label>Height</Label>
            <Input
              type="number"
              value={(element as ShapeElement).height.toString()}
              className="mt-2"
              onChange={(e) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { height: Number.parseInt(e.target.value) },
                })
              }}
            />
          </div>
          <div>
            <Label>Fill</Label>
            <ColorPicker
              color={(element as ShapeElement).fill}
              onColorChange={(color) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { fill: color },
                })
              }}
            />
          </div>
          <div>
            <Label>Opacity</Label>
            <Slider
              defaultValue={[element.opacity * 100]}
              min={0}
              max={100}
              step={1}
              className="mt-2"
              onValueChange={(value) => {
                dispatch({
                  type: ActionType.UpdateElement,
                  id: element.id,
                  changes: { opacity: value[0] / 100 },
                })
              }}
            />
          </div>
        </div>
      )
    default:
      return <div className="p-4 text-center text-gray-500">Unknown element type</div>
  }
}
