"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Settings, RefreshCw, Sparkles, PenTool, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WidgetGrid } from "@/components/dashboardv2/widget-grid"
import { WidgetSettingsDialog } from "@/components/dashboardv2/widget-settings-dialog"
import { PeriodSelector } from "@/components/dashboardv2/period-selector"
import { getDefaultDashboardConfig, DashboardConfig, WidgetSize } from "@/types/dashboard"

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year'

export default function DashboardV2Page() {
  const { user } = useAuth()
  const [period, setPeriod] = React.useState<PeriodType>('week')
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<DashboardConfig | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [editMode, setEditMode] = React.useState(false)

  React.useEffect(() => {
    if (user?.id) {
      const defaultConfig = getDefaultDashboardConfig()
      defaultConfig.userId = user.id
      setConfig(defaultConfig)
    }
  }, [user])

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }, [])

  const handleReorder = React.useCallback((activeId: string, overId: string) => {
    if (!config) return
    
    const widgets = [...config.widgets]
    const activeIndex = widgets.findIndex(w => w.id === activeId)
    const overIndex = widgets.findIndex(w => w.id === overId)
    
    if (activeIndex === -1 || overIndex === -1) return
    
    const reordered = arrayMove(widgets, activeIndex, overIndex)
    
    const updated = reordered.map((w, index) => ({
      ...w,
      order: index + 1
    }))
    
    setConfig({ ...config, widgets: updated })
  }, [config])

  const handleSizeChange = React.useCallback((widgetId: string, newSize: WidgetSize) => {
    if (!config) return
    
    const updated = config.widgets.map(w => 
      w.id === widgetId ? { ...w, size: newSize } : w
    )
    
    setConfig({ ...config, widgets: updated })
  }, [config])

  const enabledWidgets = config?.widgets
    .filter(w => w.enabled)
    .map(w => w.id) || []

  const widgetConfigs = React.useMemo(() => {
    if (!config) return {}
    const configs: Record<string, { order: number; size: WidgetSize }> = {}
    config.widgets.forEach(w => {
      configs[w.id] = { order: w.order, size: w.size }
    })
    return configs
  }, [config])

  if (!config) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-realty-gold/10 text-realty-gold rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              New
            </span>
          </div>
          <p className="text-muted-foreground">
            {editMode 
              ? 'Drag widgets to reorder, click corner icons to resize'
              : 'Customize your view with widgets that matter to you'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className={editMode ? "bg-realty-gold hover:bg-realty-gold/90" : ""}
          >
            {editMode ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4 mr-2" />
                Edit Layout
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Widget Grid */}
      <WidgetGrid 
        widgetIds={enabledWidgets}
        widgetConfigs={widgetConfigs}
        period={period}
        editMode={editMode}
        onReorder={handleReorder}
        onSizeChange={handleSizeChange}
      />

      {/* Settings Dialog */}
      <WidgetSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        config={config}
        onConfigChange={setConfig}
      />
    </div>
  )
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const result = [...array]
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
}