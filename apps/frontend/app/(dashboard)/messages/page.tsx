"use client"

import * as React from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"
import { ConversationList } from "@/components/messages/conversation-list"
import { ChatWindow } from "@/components/messages/chat-window"
import { chatApi, ConversationResponse, MessageResponse, PaginatedMessagesResponse } from "@/lib/api-chat"
import { api } from "@/lib/api"
import { MessageSquare, Phone, Video, MoreHorizontal, Send, Paperclip } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useNotifications } from "@/lib/notification-context"
import { useSocket } from "@/lib/socket-context"
import { Conversation, Message } from "@/types/chat"
import { toast } from "sonner"

function transformConversation(resp: ConversationResponse, currentUserId: string): Conversation {
    const isNewConversation = resp.id.startsWith('new_')
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
            attachments: (resp.lastMessage as any).attachments,
        } : undefined,
        unreadCount: resp.unreadCount,
        createdAt: new Date(resp.createdAt),
        updatedAt: new Date(resp.updatedAt),
        isNewConversation,
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
        attachments: resp.attachments,
    }
}

export default function MessagesPage() {
    const { user } = useAuth()
    const { incrementUnread, decrementUnread, clearUnread } = (useNotifications() || {})
    const { socket: globalSocket } = useSocket()
    const queryClient = useQueryClient()
    const [socket, setSocket] = React.useState<Socket | null>(null)
    const [conversations, setConversations] = React.useState<Conversation[]>([])
    const [selectedId, setSelectedId] = React.useState<string | null>(null)
    const [messages, setMessages] = React.useState<Message[]>([])
    const [messagesMeta, setMessagesMeta] = React.useState({ page: 1, totalPages: 1, total: 0 })
    const [loadingMessages, setLoadingMessages] = React.useState(false)
    
    const selectedIdRef = React.useRef(selectedId)
    React.useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])

    const userIdRef = React.useRef(user?.id)
    React.useEffect(() => { userIdRef.current = user?.id }, [user?.id])

    React.useEffect(() => {
        if (globalSocket) {
            setSocket(globalSocket)
        }
    }, [globalSocket])

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
            toast.success('Conversation created')
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create conversation')
        },
    })

    const handleConversationSelect = async (conv: Conversation) => {
        if (conv.isNewConversation) {
            const otherParticipant = conv.participants.find(p => p.id !== user?.id)
            if (otherParticipant) {
                await createConversation.mutateAsync(otherParticipant.id)
            }
        } else {
            setSelectedId(conv.id)
            if (conv.unreadCount > 0) {
                clearUnread?.()
            }
        }
    }

    React.useEffect(() => {
        if (conversationsData && user) {
            const transformed = conversationsData.map(c => transformConversation(c, user.id))
            setConversations(transformed)
            if (!selectedId && transformed.length > 0) {
                const firstWithMessages = transformed.find(c => !c.isNewConversation)
                setSelectedId(firstWithMessages?.id || transformed[0].id)
            }
        }
    }, [conversationsData, user])

    React.useEffect(() => {
        clearUnread?.()
    }, [clearUnread])

    React.useEffect(() => {
        if (!socket) {
            return
        }

        function handleConnect() {
            console.log('Socket connected')
        }

        function handleConnectError() {
            toast.error('Connection error. Please refresh.')
        }

        function handleNewMessageFn(message: MessageResponse) {
            const transformed = transformMessage(message)
            const isCurrentConversation = message.conversationId === selectedIdRef.current
            const isOwnMessage = message.senderId === userIdRef.current

            if (isCurrentConversation) {
                setMessages(prev => {
                    if (prev.some(m => m.id === transformed.id)) return prev
                    const filtered = prev.filter(m => !m.id.startsWith('temp_'))
                    return [...filtered, transformed]
                })
            }

            setConversations(prev => prev.map(conv => {
                if (conv.id === message.conversationId) {
                    return {
                        ...conv,
                        lastMessage: transformed,
                        unreadCount: isCurrentConversation ? 0 : conv.unreadCount + 1,
                    }
                }
                return conv
            }))

            if (!isCurrentConversation && !isOwnMessage) {
                incrementUnread?.()

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('New Message', {
                        body: `${transformed.sender?.name || 'Someone'}: ${transformed.content.substring(0, 50)}...`,
                        icon: '/favicon.ico',
                    })
                } else if ('Notification' in window && Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('New Message', {
                                body: `${transformed.sender?.name || 'Someone'}: ${transformed.content.substring(0, 50)}...`,
                                icon: '/favicon.ico',
                            })
                        }
                    })
                }

                toast.info(`New message from ${transformed.sender?.name || 'Someone'}`)
            }
        }

        function handleMessagesReadFn(data: { conversationId: string, userId: string }) {
            if (data.conversationId === selectedIdRef.current && data.userId !== userIdRef.current) {
                setMessages(prev => prev.map(m => ({ ...m, read: true })))
            }
            if (data.conversationId === selectedIdRef.current) {
                setConversations(prev =>
                    prev.map(c =>
                        c.id === data.conversationId ? { ...c, unreadCount: 0 } : c
                    )
                )
            }
        }

        function handleErrorFn(data: { message: string }) {
            toast.error(data.message)
        }

        socket.on('connect', handleConnect)
        socket.on('connect_error', handleConnectError)
        socket.on('new_message', handleNewMessageFn)
        socket.on('messages_read', handleMessagesReadFn)
        socket.on('error', handleErrorFn)

        return () => {
            socket.off('connect', handleConnect)
            socket.off('connect_error', handleConnectError)
            socket.off('new_message', handleNewMessageFn)
            socket.off('messages_read', handleMessagesReadFn)
            socket.off('error', handleErrorFn)
        }
    }, [socket])

    const loadMessages = React.useCallback(async (conversationId: string, page: number = 1) => {
        setLoadingMessages(true)
        try {
            const response = await chatApi.getMessages(conversationId, page)
            setMessages(prev => {
                const transformed = response.messages.map(transformMessage).reverse()
                const existingIds = new Set(prev.map(m => m.id))
                const newMessages = transformed.filter(m => !existingIds.has(m.id))
                return page === 1 ? transformed : [...newMessages, ...prev]
            })
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

        if (selectedId.startsWith('new_')) {
            setMessages([])
            return
        }

        setMessages([])
        setMessagesMeta({ page: 1, totalPages: 1, total: 0 })

        loadMessages(selectedId, 1)

        socket.emit('join_conversation', { conversationId: selectedId })
        socket.emit('mark_read', { conversationId: selectedId })

        return () => {
            socket.emit('leave_conversation', { conversationId: selectedId })
        }
    }, [selectedId, socket, loadMessages])

    const handleSendMessage = async (content: string, attachments?: any[]) => {
        if (!selectedId || !socket || !user) return

        const tempId = `temp_${Date.now()}`
        const optimisticMessage: Message = {
            id: tempId,
            content,
            senderId: user.id,
            sender: { id: user.id, name: user.name },
            timestamp: new Date(),
            read: false,
            attachments,
        }

        setMessages(prev => {
            if (prev.some(m => m.id === tempId)) return prev
            return [...prev, optimisticMessage]
        })

        const selectedConv = conversations.find(c => c.id === selectedId)
        
        if (selectedConv?.isNewConversation) {
            const otherParticipant = selectedConv.participants.find(p => p.id !== user.id)
            if (!otherParticipant) return

            try {
                const newConv = await createConversation.mutateAsync(otherParticipant.id)
                setSelectedId(newConv.id)
                socket.emit('join_conversation', { conversationId: newConv.id })
                socket.emit('send_message', {
                    conversationId: newConv.id,
                    content,
                    attachments,
                })
            } catch (error) {
                setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
            }
        } else {
            socket.emit('send_message', {
                conversationId: selectedId,
                content,
                attachments,
            })
        }
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
        <div className="h-[calc(100vh-64px)] -m-6 flex flex-col md:flex-row bg-background overflow-hidden relative">
            <div className="flex flex-col h-full border-r border-border/50 bg-card/30 backdrop-blur-xl w-80 min-w-[320px] relative z-20">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground tracking-tight">Messages</h2>
                    <div className="h-2 w-2 rounded-full bg-realty-gold animate-pulse" />
                </div>
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedId || undefined}
                    onSelect={(id) => {
                        const conv = conversations.find(c => c.id === id)
                        if (conv) {
                            handleConversationSelect(conv)
                        }
                    }}
                    currentUserId={user.id}
                />
            </div>
            <div className="flex-1 flex flex-col min-w-0 bg-background relative z-10">
                {selectedConversation ? (
                    <ChatWindow
                        conversation={{ ...selectedConversation, messages }}
                        onSendMessage={handleSendMessage}
                        currentUserId={user.id}
                        isLoading={loadingMessages}
                        hasMore={messagesMeta.page < messagesMeta.totalPages}
                        onLoadMore={() => loadMessages(selectedId!, messagesMeta.page + 1)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    )
}