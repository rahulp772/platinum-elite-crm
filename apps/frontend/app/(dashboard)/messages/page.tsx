"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"
import { chatApi, ConversationResponse, MessageResponse } from "@/lib/api-chat"
import { useAuth } from "@/lib/auth-context"
import { Conversation, Message } from "@/types/chat"

function transformConversation(resp: ConversationResponse, currentUserId: string): Conversation {
    const otherParticipants = resp.participants.filter(p => p.id !== currentUserId)
    const isGroup = resp.participants.length > 2
    
    return {
        id: resp.id,
        participants: resp.participants.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            avatar: p.avatar,
            status: "offline" as const,
        })),
        groupName: isGroup ? `Group (${resp.participants.length})` : undefined,
        messages: [],
        lastMessage: resp.lastMessage ? {
            id: resp.lastMessage.id,
            content: resp.lastMessage.content,
            senderId: resp.lastMessage.senderId,
            timestamp: new Date(resp.lastMessage.timestamp),
            read: resp.lastMessage.read,
        } : undefined,
        unreadCount: resp.unreadCount,
        createdAt: new Date(resp.createdAt),
        updatedAt: new Date(resp.updatedAt),
    }
}

function transformMessage(resp: MessageResponse): Message {
    return {
        id: resp.id,
        content: resp.content,
        senderId: resp.senderId,
        sender: resp.sender,
        timestamp: new Date(resp.timestamp),
        read: resp.read,
    }
}

export default function MessagesPage() {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const [socket, setSocket] = React.useState<Socket | null>(null)
    const [conversations, setConversations] = React.useState<Conversation[]>([])
    const [selectedId, setSelectedId] = React.useState<string | null>(null)
    const [messages, setMessages] = React.useState<Message[]>([])

    const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: chatApi.getConversations,
        enabled: !!user,
    })

    React.useEffect(() => {
        if (conversationsData && user) {
            const transformed = conversationsData.map(c => transformConversation(c, user.id))
            setConversations(transformed)
            if (!selectedId && transformed.length > 0) {
                setSelectedId(transformed[0].id)
            }
        }
    }, [conversationsData, user])

    React.useEffect(() => {
        if (!user) return

        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
            auth: { token: localStorage.getItem('token') },
        })

        newSocket.on('connect', () => {
            console.log('Socket connected')
        })

        newSocket.on('new_message', (message: MessageResponse) => {
            const transformed = transformMessage(message)
            setMessages(prev => [...prev, transformed])
            
            setConversations(prev => prev.map(conv => {
                if (conv.id === message.conversationId) {
                    return {
                        ...conv,
                        lastMessage: transformed,
                        unreadCount: conv.id === selectedId ? 0 : conv.unreadCount + 1,
                    }
                }
                return conv
            }))
        })

        newSocket.on('messages_read', (data: { conversationId: string }) => {
            setMessages(prev => prev.map(m => ({ ...m, read: true })))
            setConversations(prev => prev.map(c => 
                c.id === data.conversationId ? { ...c, unreadCount: 0 } : c
            ))
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user])

    React.useEffect(() => {
        if (!selectedId || !socket) return

        chatApi.getMessages(selectedId).then(msgs => {
            setMessages(msgs.map(transformMessage))
        })

        socket.emit('join_conversation', { conversationId: selectedId })
        socket.emit('mark_read', { conversationId: selectedId })

        return () => {
            socket.emit('leave_conversation', { conversationId: selectedId })
        }
    }, [selectedId, socket])

    const handleSendMessage = (content: string) => {
        if (!selectedId || !socket) return

        socket.emit('send_message', {
            conversationId: selectedId,
            content,
        })
    }

    React.useEffect(() => {
        if (selectedId) {
            setConversations(prev => prev.map(conv => 
                conv.id === selectedId ? { ...conv, unreadCount: 0 } : conv
            ))
        }
    }, [selectedId])

    if (!user) {
        return <div className="p-8">Please log in to view messages.</div>
    }

    if (conversationsLoading) {
        return <div className="p-8">Loading conversations...</div>
    }

    const selectedConversation = conversations.find(c => c.id === selectedId)

    return (
        <div className="h-[calc(100vh-2rem)] -m-8 flex flex-col md:flex-row bg-background">
            <ConversationList
                conversations={conversations}
                selectedId={selectedId || undefined}
                onSelect={setSelectedId}
                currentUserId={user.id}
            />
            <div className="flex-1 border-l bg-background/50">
                {selectedConversation ? (
                    <ChatWindow
                        conversation={{ ...selectedConversation, messages }}
                        onSendMessage={handleSendMessage}
                        currentUserId={user.id}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    )
}