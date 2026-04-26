"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { getWidgetDefinition, WidgetSize } from "@/types/dashboard"
import { DraggableWidget } from "./draggable-widget"
import { StatsOverviewWidget } from "./widgets/stats-overview-widget"
import { StatsResponseTimeWidget } from "./widgets/stats-response-time-widget"
import { StatsPipelineValueWidget } from "./widgets/stats-pipeline-value-widget"
import { ActiveDealsWidget } from "./widgets/active-deals-widget"
import { ClosingSoonWidget } from "./widgets/closing-soon-widget"
import { DealsByStageWidget } from "./widgets/deals-by-stage-widget"
import { LeadFunnelWidget } from "./widgets/lead-funnel-widget"
import { HotLeadsWidget } from "./widgets/hot-leads-widget"
import { LeadSourcesWidget } from "./widgets/lead-sources-widget"
import { TodayTasksWidget } from "./widgets/today-tasks-widget"
import { UpcomingTasksWidget } from "./widgets/upcoming-tasks-widget"
import { TeamPerformanceWidget } from "./widgets/team-performance-widget"
import { TeamActivityWidget } from "./widgets/team-activity-widget"
import { ActiveListingsWidget } from "./widgets/active-listings-widget"
import { ExpiringPropertiesWidget } from "./widgets/expiring-properties-widget"
import { TodayScheduleWidget } from "./widgets/today-schedule-widget"
import { WeekScheduleWidget } from "./widgets/week-schedule-widget"
import { RevenueTrendWidget } from "./widgets/revenue-trend-widget"
import { FollowUpActionWidget } from "./widgets/follow-up-action-widget"

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year'

interface WidgetGridProps {
  widgetIds: string[]
  widgetConfigs: Record<string, { order: number; size: WidgetSize }>
  period: PeriodType
  editMode: boolean
  onReorder: (activeId: string, overId: string) => void
  onSizeChange: (widgetId: string, size: WidgetSize) => void
}

const WIDGET_COMPONENTS: Record<string, React.FC<{ period: PeriodType }>> = {
  'stats-overview': StatsOverviewWidget,
  'stats-response-time': StatsResponseTimeWidget,
  'stats-pipeline-value': StatsPipelineValueWidget,
  'pipeline-deals': ActiveDealsWidget,
  'pipeline-closing-soon': ClosingSoonWidget,
  'pipeline-by-stage': DealsByStageWidget,
  'leads-funnel': LeadFunnelWidget,
  'leads-hot': HotLeadsWidget,
  'leads-sources': LeadSourcesWidget,
  'leads-action': FollowUpActionWidget,
  'tasks-today': TodayTasksWidget,
  'tasks-upcoming': UpcomingTasksWidget,
  'team-performance': TeamPerformanceWidget,
  'team-activity': TeamActivityWidget,
  'properties-active': ActiveListingsWidget,
  'properties-expiring': ExpiringPropertiesWidget,
  'schedule-today': TodayScheduleWidget,
  'schedule-week': WeekScheduleWidget,
  'analytics-revenue': RevenueTrendWidget,
}

export function WidgetGrid({ 
  widgetIds, 
  widgetConfigs, 
  period, 
  editMode, 
  onReorder,
  onSizeChange 
}: WidgetGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string)
    }
  }

  const sortedIds = React.useMemo(() => {
    return [...widgetIds].sort((a, b) => {
      const configA = widgetConfigs[a] || { order: 0 }
      const configB = widgetConfigs[b] || { order: 0 }
      return configA.order - configB.order
    })
  }, [widgetIds, widgetConfigs])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={sortedIds} 
        strategy={rectSortingStrategy}
        disabled={!editMode}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
          {sortedIds.map((id) => {
            const Component = WIDGET_COMPONENTS[id]
            const config = widgetConfigs[id] || { order: 0, size: 'medium' }
            
            if (!Component) return null
            
            return (
              <DraggableWidget
                key={id}
                id={id}
                editMode={editMode}
                size={config.size}
                onSizeChange={(newSize) => onSizeChange(id, newSize)}
              >
                <div className="h-full">
                  <Component period={period} />
                </div>
              </DraggableWidget>
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}