"use client"

import * as React from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"
import { chatApi, ConversationResponse, MessageResponse, PaginatedMessagesResponse } from "@/lib/api-chat"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Conversation, Message } from "@/types/chat"
import { toast } from "sonner"

interface TeamMember {
    id: string
    name: string
    email: string
    avatar?: string
    status?: string
}

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
    const [showTeamMembers, setShowTeamMembers] = React.useState(true)
    const [messagesMeta, setMessagesMeta] = React.useState({ page: 1, totalPages: 1, total: 0 })
    const [loadingMessages, setLoadingMessages] = React.useState(false)

    const { data: conversationsData, isLoading: conversationsLoading, error: conversationsError } = useQuery({
        queryKey: ['conversations'],
        queryFn: chatApi.getConversations,
        enabled: !!user,
    })

    React.useEffect(() => {
        if (conversationsError) {
            toast.error('Failed to load conversations')
        }
    }, [conversationsError])

    const [teamMembersKey, setTeamMembersKey] = React.useState(0)

    const { data: teamMembersData } = useQuery<TeamMember[]>({
        queryKey: ['team-members', teamMembersKey],
        queryFn: async () => {
            const { data } = await api.get<TeamMember[]>('/users')
            return data.filter(u => u.id !== user?.id)
        },
        enabled: !!user,
    })

    const createConversation = useMutation({
        mutationFn: async (participantId: string) => {
            const { data } = await api.post<ConversationResponse>('/chat/conversations', {
                participantIds: [participantId],
            })
            return data
        },
        onSuccess: async (newConv) => {
            await queryClient.invalidateQueries({ queryKey: ['conversations'] })
            setSelectedId(newConv.id)
            setShowTeamMembers(false)
            setTeamMembersKey(k => k + 1)
            toast.success('Conversation created')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create conversation')
        },
    })

    const handleTeamMemberClick = async (member: TeamMember) => {
        const existingConv = conversations.find(c => 
            c.participants.some(p => p.id === member.id)
        )
        if (existingConv) {
            setSelectedId(existingConv.id)
            setShowTeamMembers(false)
        } else {
            await createConversation.mutateAsync(member.id)
            setTeamMembersKey(k => k + 1)
        }
    }

    React.useEffect(() => {
        if (conversationsData && user) {
            const transformed = conversationsData.map(c => transformConversation(c, user.id))
            setConversations(transformed)
            if (!selectedId && transformed.length > 0) {
                setSelectedId(transformed[0].id)
            }
        }
    }, [conversationsData, user])

    const showConversations = conversations.length > 0 && !showTeamMembers

    React.useEffect(() => {
        if (!user) return

        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
            auth: { token: localStorage.getItem('token') },
        })

        newSocket.on('connect', () => {
            console.log('Socket connected')
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            toast.error('Connection error. Please refresh.')
        })

        newSocket.on('new_message', (message: MessageResponse) => {
            const transformed = transformMessage(message)
            
            if (message.conversationId === selectedId) {
                setMessages(prev => [...prev, transformed])
            }
            
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
            if (data.conversationId === selectedId) {
                setMessages(prev => prev.map(m => ({ ...m, read: true })))
            }
            setConversations(prev => prev.map(c => 
                c.id === data.conversationId ? { ...c, unreadCount: 0 } : c
            ))
        })

        newSocket.on('error', (data: { message: string }) => {
            toast.error(data.message)
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user])

    const loadMessages = React.useCallback(async (conversationId: string, page: number = 1) => {
        setLoadingMessages(true)
        try {
            const response = await chatApi.getMessages(conversationId, page)
            const transformed = response.messages.map(transformMessage)
            setMessages(prev => page === 1 ? transformed : [...prev, ...transformed])
            setMessagesMeta({
                page: response.page,
                totalPages: response.totalPages,
                total: response.total,
            })
        } catch (error: any) {
            toast.error(error.message || 'Failed to load messages')
        } finally {
            setLoadingMessages(false)
        }
    }, [])

    React.useEffect(() => {
        if (!selectedId || !socket) return

        setMessages([])
        setMessagesMeta({ page: 1, totalPages: 1, total: 0 })

        loadMessages(selectedId, 1)

        socket.emit('join_conversation', { conversationId: selectedId })
        socket.emit('mark_read', { conversationId: selectedId })

        return () => {
            socket.emit('leave_conversation', { conversationId: selectedId })
        }
    }, [selectedId, socket, loadMessages])

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
            <div className="flex flex-col h-full border-r bg-muted/10 w-80 min-w-[320px]">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-semibold">Messages</h2>
                    <button
                        onClick={() => setShowTeamMembers(!showTeamMembers)}
                        className="text-xs text-primary hover:underline"
                    >
                        {showTeamMembers ? "Chats" : "Team"}
                    </button>
                </div>
                {showTeamMembers ? (
                    <div className="flex-1 overflow-auto p-2">
                        <p className="text-xs text-muted-foreground mb-2 px-2">Start a conversation with team members</p>
                        {teamMembersData?.map(member => (
                            <button
                                key={member.id}
                                onClick={() => handleTeamMemberClick(member)}
                                className="flex items-center gap-3 w-full p-3 rounded-lg text-left hover:bg-muted transition-colors"
                            >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                    {member.name[0]}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="font-medium text-sm">{member.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedId || undefined}
                        onSelect={(id) => {
                            setSelectedId(id)
                            setShowTeamMembers(false)
                        }}
                        currentUserId={user.id}
                    />
                )}
            </div>
            <div className="flex-1 border-l bg-background/50">
                {!showTeamMembers && selectedConversation ? (
                    <ChatWindow
                        conversation={{ ...selectedConversation, messages }}
                        onSendMessage={handleSendMessage}
                        currentUserId={user.id}
                        isLoading={loadingMessages}
                        hasMore={messagesMeta.page < messagesMeta.totalPages}
                        onLoadMore={() => loadMessages(selectedId!, messagesMeta.page + 1)}
                    />
                ) : !showTeamMembers ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a conversation to start chatting
                    </div>
                ) : null}
            </div>
        </div>
    )
}