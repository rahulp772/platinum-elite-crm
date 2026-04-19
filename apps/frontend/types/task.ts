export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"
export type TaskType = "call" | "meeting" | "email" | "deadline" | "todo"

export interface Task {
    id: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    type: TaskType
    dueDate: Date
    relatedTo?: {
        id: string
        type: "deal" | "property" | "lead"
        name: string
    }
    assignedTo: string
    createdAt: Date
}
