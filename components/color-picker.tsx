"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(color)
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(color)
  }, [color])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputValue(newColor)
    onChange(newColor)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Only update the actual color if it's a valid hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleHexInputBlur = () => {
    // If the input is not a valid hex color when blurring, revert to the previous valid color
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(inputValue)) {
      setInputValue(color)
    } else {
      onChange(inputValue)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label className="text-sm">{label}</Label>}
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-10 h-10 rounded border overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ backgroundColor: color }}
              aria-label="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex flex-col gap-2">
              <input
                ref={colorInputRef}
                type="color"
                value={color}
                onChange={handleColorChange}
                className="w-48 h-48 cursor-pointer border-0 p-0 m-0"
                style={{ appearance: "auto" }}
              />
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="hex-input" className="text-xs whitespace-nowrap">
                  Hex:
                </Label>
                <Input
                  id="hex-input"
                  value={inputValue}
                  onChange={handleHexInputChange}
                  onBlur={handleHexInputBlur}
                  className="h-8 text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Input
          value={inputValue}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          className="flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
