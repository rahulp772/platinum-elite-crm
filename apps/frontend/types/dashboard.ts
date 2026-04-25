export type WidgetCategory = 'stats' | 'pipeline' | 'leads' | 'tasks' | 'team' | 'properties' | 'schedule' | 'analytics'

export interface WidgetDefinition {
  id: string
  title: string
  description?: string
  category: WidgetCategory
  defaultEnabled: boolean
  size?: 'small' | 'medium' | 'large'
  order: number
}

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

export interface WidgetConfig {
  id: string
  enabled: boolean
  order: number
  size: WidgetSize
}

export interface DashboardConfig {
  userId: string
  widgets: WidgetConfig[]
  updatedAt?: string
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  // Stats
  { id: 'stats-overview', title: 'Overview Stats', category: 'stats', defaultEnabled: true, size: 'large', order: 1 },
  { id: 'stats-response-time', title: 'Lead Response Time', category: 'stats', defaultEnabled: true, size: 'medium', order: 2 },
  { id: 'stats-pipeline-value', title: 'Pipeline Value', category: 'stats', defaultEnabled: true, size: 'medium', order: 3 },
  
  // Pipeline
  { id: 'pipeline-deals', title: 'Active Deals', category: 'pipeline', defaultEnabled: true, size: 'large', order: 4 },
  { id: 'pipeline-closing-soon', title: 'Closing Soon', category: 'pipeline', defaultEnabled: true, size: 'medium', order: 5 },
  { id: 'pipeline-by-stage', title: 'Deals by Stage', category: 'pipeline', defaultEnabled: false, size: 'medium', order: 6 },
  
  // Leads
  { id: 'leads-funnel', title: 'Lead Funnel', category: 'leads', defaultEnabled: true, size: 'medium', order: 7 },
  { id: 'leads-hot', title: 'Hot Leads', category: 'leads', defaultEnabled: true, size: 'medium', order: 8 },
  { id: 'leads-sources', title: 'Lead Sources', category: 'leads', defaultEnabled: false, size: 'small', order: 9 },
  
  // Tasks
  { id: 'tasks-today', title: "Today's Tasks", category: 'tasks', defaultEnabled: true, size: 'medium', order: 10 },
  { id: 'tasks-upcoming', title: 'Upcoming Tasks', category: 'tasks', defaultEnabled: true, size: 'medium', order: 11 },
  
  // Team
  { id: 'team-performance', title: 'Team Performance', category: 'team', defaultEnabled: true, size: 'large', order: 12 },
  { id: 'team-activity', title: 'Team Activity', category: 'team', defaultEnabled: false, size: 'medium', order: 13 },
  
  // Properties
  { id: 'properties-active', title: 'Active Listings', category: 'properties', defaultEnabled: true, size: 'medium', order: 14 },
  { id: 'properties-expiring', title: 'Expiring Soon', category: 'properties', defaultEnabled: true, size: 'small', order: 15 },
  
  // Schedule
  { id: 'schedule-today', title: 'Today\'s Schedule', category: 'schedule', defaultEnabled: true, size: 'medium', order: 16 },
  { id: 'schedule-week', title: 'Week View', category: 'schedule', defaultEnabled: false, size: 'large', order: 17 },
  
  // Analytics
  { id: 'analytics-revenue', title: 'Revenue Trend', category: 'analytics', defaultEnabled: true, size: 'medium', order: 18 },
]

export function getDefaultDashboardConfig(): DashboardConfig {
  return {
    userId: '',
    widgets: WIDGET_REGISTRY
      .filter(w => w.defaultEnabled)
      .map(w => ({ 
        id: w.id, 
        enabled: true, 
        order: w.order,
        size: w.size || 'medium'
      })),
  }
}

export function getWidgetDefinition(id: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find(w => w.id === id)
}