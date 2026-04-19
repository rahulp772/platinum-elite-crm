export type UserStatus = "online" | "offline" | "away"

export interface User {
    id: string
    name: string
    avatar: string
    status: UserStatus
    email: string
}

export interface Message {
    id: string
    content: string
    senderId: string
    timestamp: Date
    read: boolean
}

export interface Conversation {
    id: string
    participant: User
    messages: Message[]
    lastMessage: Message
    unreadCount: number
}
