import { Conversation, User } from "@/types/chat"

const currentUser: User = {
    id: "me",
    name: "Indica Watson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Indica",
    status: "online",
    email: "indica@realestate.com",
}

const users: User[] = [
    {
        id: "user1",
        name: "Alice Freeman",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        status: "online",
        email: "alice@example.com",
    },
    {
        id: "user2",
        name: "Robert Liu",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
        status: "offline",
        email: "robert@tech.co",
    },
    {
        id: "user3",
        name: "Sarah Connor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        status: "away",
        email: "sarah@design.io",
    },
    {
        id: "user4",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        status: "offline",
        email: "mike@example.com",
    },
]

export const mockConversations: Conversation[] = [
    {
        id: "conv1",
        participants: [currentUser, users[0]],
        unreadCount: 2,
        messages: [
            {
                id: "m1-1",
                content: "Hi Indica, I saw the downtown loft posting. Is it still available?",
                senderId: "user1",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                read: true,
            },
            {
                id: "m1-2",
                content: "Yes, it is! Would you like to schedule a viewing?",
                senderId: "me",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.9),
                read: true,
            },
            {
                id: "m1-3",
                content: "That would be great. How about tomorrow afternoon?",
                senderId: "user1",
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                read: false,
            },
            {
                id: "m1-4",
                content: "Around 2 PM works best for me.",
                senderId: "user1",
                timestamp: new Date(Date.now() - 1000 * 60 * 29),
                read: false,
            },
        ],
        lastMessage: {
            id: "m1-4",
            content: "Around 2 PM works best for me.",
            senderId: "user1",
            timestamp: new Date(Date.now() - 1000 * 60 * 29),
            read: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "conv2",
        participants: [currentUser, users[1]],
        unreadCount: 0,
        messages: [
            {
                id: "m2-1",
                content: "I've sent over the signed documents.",
                senderId: "user2",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                read: true,
            },
            {
                id: "m2-2",
                content: "Received! passed them to the legal team.",
                senderId: "me",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
                read: true,
            },
        ],
        lastMessage: {
            id: "m2-2",
            content: "Received! passed them to the legal team.",
            senderId: "me",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
            read: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "conv3",
        participants: [currentUser, users[2]],
        unreadCount: 0,
        messages: [
            {
                id: "m3-1",
                content: "Thanks for showing us the townhouse today.",
                senderId: "user3",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
                read: true,
            },
        ],
        lastMessage: {
            id: "m3-1",
            content: "Thanks for showing us the townhouse today.",
            senderId: "user3",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
            read: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "conv4",
        participants: [currentUser, users[3]],
        unreadCount: 5,
        messages: [
            {
                id: "m4-1",
                content: "Hey, are there any new 3bd units?",
                senderId: "user4",
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                read: false,
            },
        ],
        lastMessage: {
            id: "m4-1",
            content: "Hey, are there any new 3bd units?",
            senderId: "user4",
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            read: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]
