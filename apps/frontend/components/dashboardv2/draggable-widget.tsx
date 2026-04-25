"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { WidgetSize } from "@/types/dashboard"

interface DraggableWidgetProps {
  id: string
  children: React.ReactNode
  editMode: boolean
  size: WidgetSize
  onSizeChange: (newSize: WidgetSize) => void
}

const SIZE_ORDER: WidgetSize[] = ['medium', 'large', 'full', 'small']

export function DraggableWidget({ 
  id, 
  children, 
  editMode, 
  size, 
  onSizeChange 
}: DraggableWidgetProps) {
  const resizeRef = React.useRef<HTMLDivElement>(null)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [localSize, setLocalSize] = React.useState(size)
  
  React.useEffect(() => {
    setLocalSize(size)
  }, [size])

  React.useEffect(() => {
    if (!editMode || !resizeRef.current) return
    
    const element = resizeRef.current
    
    const handleResize = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const startX = e.clientX
      const startColSpan = localSize === 'full' ? 4 : localSize === 'large' ? 2 : 1
      
      const gridElement = element.closest('.grid')
      const gridWidth = gridElement?.clientWidth || 800
      const colWidth = gridWidth / 4
      
      const onMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX
        const deltaCols = Math.round(deltaX / colWidth)
        let newColSpan = startColSpan + deltaCols
        newColSpan = Math.max(1, Math.min(4, newColSpan))
        
        let newSize: WidgetSize = 'medium'
        if (newColSpan >= 4) newSize = 'full'
        else if (newColSpan >= 2) newSize = 'large'
        else newSize = 'medium'
        
        setLocalSize(newSize)
        onSizeChange(newSize)
      }
      
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
    
    element.addEventListener('mousedown', handleResize)
    
    return () => {
      element.removeEventListener('mousedown', handleResize)
    }
  }, [editMode, localSize, onSizeChange])

  const getGridClasses = () => {
    switch (localSize) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-1'
      case 'large': return 'col-span-2'
      case 'full': return 'col-span-4'
      default: return 'col-span-1'
    }
  }

  const cycleSize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const currentIndex = SIZE_ORDER.indexOf(localSize)
    const nextIndex = (currentIndex + 1) % SIZE_ORDER.length
    const newSize = SIZE_ORDER[nextIndex]
    
    setLocalSize(newSize)
    onSizeChange(newSize)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        getGridClasses(),
        "relative",
        isDragging && "z-50 opacity-90",
        editMode && "ring-2 ring-dashed ring-realty-gold/50 rounded-lg"
      )}
    >
      {/* Drag Handle */}
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 left-3 z-50 cursor-grab active:cursor-grabbing p-1.5 rounded-md bg-background/90 hover:bg-background border shadow-sm"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Widget Content */}
      <div className="h-full min-h-[200px]">
        {children}
      </div>

      {/* Resize Handle */}
      {editMode && (
        <div
          ref={resizeRef}
          className="absolute bottom-0 right-0 cursor-se-resize select-none"
          style={{
            width: '32px',
            height: '32px',
            zIndex: 999,
          }}
          onClick={cycleSize}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-6 h-6 text-realty-gold/70 hover:text-realty-gold transition-colors"
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
            }}
          >
            <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM14 22H12V20H14V22ZM18 18H16V16H18V18ZM18 14H16V12H18V14ZM14 18H12V16H14V18Z" />
          </svg>
        </div>
      )}
    </div>
  )
}