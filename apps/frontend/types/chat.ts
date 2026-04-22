export type UserStatus = "online" | "offline" | "away"

export interface User {
    id: string
    name: string
    avatar?: string
    status?: UserStatus
    email: string
}

export interface Message {
    id: string
    content: string
    senderId: string
    sender?: {
        id: string
        name: string
        avatar?: string
    }
    timestamp: Date
    read: boolean
}

export interface Conversation {
    id: string
    participants: User[]
    groupName?: string
    messages: Message[]
    lastMessage?: Message
    unreadCount: number
    createdAt: Date
    updatedAt: Date
    isNewConversation?: boolean
}