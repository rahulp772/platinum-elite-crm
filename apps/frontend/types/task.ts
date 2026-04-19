export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"
export type TaskType = "call" | "meeting" | "email" | "deadline" | "todo"

export const TaskStatus = {
    Todo: "todo",
    InProgress: "in_progress",
    Done: "done",
} as const

export const TaskPriority = {
    Low: "low",
    Medium: "medium",
    High: "high",
} as const

export interface UserSummary {
    id: string
    name: string
    email: string
    role?: {
        name: string
        level: number
    }
}

export interface Task {
    id: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    type: TaskType
    dueDate: Date
    relatedToId?: string
    relatedToType?: "deal" | "property" | "lead"
    assignedTo?: UserSummary
    assignedToId?: string
    createdBy?: UserSummary
    createdById?: string
    tenantId?: string
    createdAt: Date
    updatedAt: Date
}
