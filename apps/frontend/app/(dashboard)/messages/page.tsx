"use client"

import * as React from "react"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"
import { mockConversations } from "@/lib/mock-data/messages"
import { Conversation, Message } from "@/types/chat"

export default function MessagesPage() {
    const [conversations, setConversations] = React.useState<Conversation[]>(mockConversations)
    const [selectedId, setSelectedId] = React.useState<string>(mockConversations[0].id)

    const selectedConversation = conversations.find(c => c.id === selectedId)!

    const handleSendMessage = (content: string) => {
        const newMessage: Message = {
            id: crypto.randomUUID(),
            content,
            senderId: "me",
            timestamp: new Date(),
            read: true
        }

        setConversations(prev => prev.map(conv => {
            if (conv.id === selectedId) {
                return {
                    ...conv,
                    messages: [...conv.messages, newMessage]
                }
            }
            return conv
        }))
    }

    // Mark as read on select (simple implementation)
    React.useEffect(() => {
        setConversations(prev => prev.map(conv => {
            if (conv.id === selectedId && conv.unreadCount > 0) {
                return { ...conv, unreadCount: 0 }
            }
            return conv
        }))
    }, [selectedId])

    return (
        <div className="h-[calc(100vh-2rem)] -m-8 flex flex-col md:flex-row bg-background">
            <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
            <div className="flex-1 border-l bg-background/50">
                <ChatWindow
                    conversation={selectedConversation}
                    onSendMessage={handleSendMessage}
                />
            </div>
        </div>
    )
}
