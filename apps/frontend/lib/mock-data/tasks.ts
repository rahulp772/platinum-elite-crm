import { Task } from "@/types/task"

export const mockTasks: Task[] = [
    {
        id: "TSK-001",
        title: "Call Alice about downtown loft",
        description: "Follow up on the viewing from yesterday. Discuss price negotiation.",
        status: "todo",
        priority: "high",
        type: "call",
        dueDate: new Date(new Date().setHours(14, 0, 0, 0)), // Today at 2 PM
        relatedTo: {
            id: "DEA-001",
            type: "deal",
            name: "Downtown Loft Purchase",
        },
        assignedTo: "Indica Watson",
        createdAt: new Date("2024-01-20"),
    },
    {
        id: "TSK-002",
        title: "Prepare contract for Riverside Condo",
        description: "Draft the initial purchase agreement for Robert Liu.",
        status: "in_progress",
        priority: "high",
        type: "deadline",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        relatedTo: {
            id: "DEA-002",
            type: "deal",
            name: "Riverside Condo Investment",
        },
        assignedTo: "Indica Watson",
        createdAt: new Date("2024-01-21"),
    },
    {
        id: "TSK-003",
        title: "Lunch meeting with The Wilsons",
        status: "done",
        priority: "medium",
        type: "meeting",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
        relatedTo: {
            id: "DEA-005",
            type: "deal",
            name: "Family Home Upgrade",
        },
        assignedTo: "Indica Watson",
        createdAt: new Date("2024-01-18"),
    },
    {
        id: "TSK-004",
        title: "Email listings to Sarah",
        description: "Send similar townhouse listings in Brooklyn Heights.",
        status: "todo",
        priority: "medium",
        type: "email",
        dueDate: new Date(), // Today
        relatedTo: {
            id: "LEA-003",
            type: "lead",
            name: "Sarah Connor",
        },
        assignedTo: "Indica Watson",
        createdAt: new Date("2024-01-22"),
    },
    {
        id: "TSK-005",
        title: "Update property photos",
        description: "New photos received from photographer for 555 Business Blvd.",
        status: "todo",
        priority: "low",
        type: "todo",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        relatedTo: {
            id: "PROP-005",
            type: "property",
            name: "Prime Commercial Space",
        },
        assignedTo: "Indica Watson",
        createdAt: new Date("2024-01-22"),
    },
    {
        id: "TSK-006",
        title: "Quarterly Review",
        status: "todo",
        priority: "medium",
        type: "meeting",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        assignedTo: "Indica Watson",
        createdAt: new Date("2024-01-15"),
    },
]
