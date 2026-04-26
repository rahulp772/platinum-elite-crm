"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { WIDGET_REGISTRY, DashboardConfig, getDefaultDashboardConfig, WidgetSize } from "@/types/dashboard"
import { Settings2, RotateCcw, GripVertical, LayoutGrid } from "lucide-react"

interface WidgetSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: DashboardConfig | null
  onConfigChange: (config: DashboardConfig) => void
}

const SIZE_LABELS: Record<WidgetSize, string> = {
  small: 'S',
  medium: 'M',
  large: 'L',
  full: 'F',
}

export function WidgetSettingsDialog({ open, onOpenChange, config, onConfigChange }: WidgetSettingsDialogProps) {
  const handleToggle = (widgetId: string, enabled: boolean) => {
    if (!config) return
    
    const newWidgets = config.widgets.map(w => 
      w.id === widgetId ? { ...w, enabled } : w
    )
    
    onConfigChange({ ...config, widgets: newWidgets })
  }

  const handleReset = () => {
    const defaultConfig = getDefaultDashboardConfig()
    defaultConfig.userId = config?.userId || ''
    onConfigChange(defaultConfig)
  }

  const isEnabled = (id: string) => config?.widgets.find(w => w.id === id)?.enabled ?? false

  const sortedWidgets = React.useMemo(() => {
    return [...WIDGET_REGISTRY].sort((a, b) => a.order - b.order)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Toggle widgets on or off. Use "Edit Layout" on the dashboard to drag and resize widgets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          {sortedWidgets.map((widget) => {
            const isOn = isEnabled(widget.id)
            return (
              <div 
                key={widget.id} 
                className={`flex items-center justify-between p-2 rounded-lg ${isOn ? 'bg-accent/50' : 'opacity-60'}`}
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={widget.id} className="cursor-pointer text-sm">
                    {widget.title}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
                    {SIZE_LABELS[widget.size || 'medium']}
                  </span>
                  <Switch
                    id={widget.id}
                    checked={isOn}
                    onCheckedChange={(checked) => handleToggle(widget.id, checked)}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}