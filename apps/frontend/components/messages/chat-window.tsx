"use client"

import * as React from "react"
import { Conversation, Message } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Video, MoreHorizontal, Send, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ChatWindowProps {
    conversation: Conversation
    onSendMessage: (content: string) => void
    currentUserId: string
    isLoading?: boolean
    hasMore?: boolean
    onLoadMore?: () => void
}

function getOtherParticipant(conv: Conversation, currentUserId: string): { name: string; avatar?: string; status: "online" | "offline" | "away" } {
    if (conv.participants.length > 2) {
        return {
            name: `Group (${conv.participants.length})`,
            avatar: undefined,
            status: "offline" as const,
        }
    }
    const other = conv.participants.find(p => p.id !== currentUserId) || conv.participants[0]
    return {
        name: other.name,
        avatar: other.avatar,
        status: other.status || "offline",
    }
}

export function ChatWindow({ 
    conversation, 
    onSendMessage, 
    currentUserId,
    isLoading = false,
    hasMore = false,
    onLoadMore,
}: ChatWindowProps) {
    const [message, setMessage] = React.useState("")
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [isAtBottom, setIsAtBottom] = React.useState(true)

    const participant = getOtherParticipant(conversation, currentUserId)

    React.useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
                if (isAtBottom) {
                    viewport.scrollTop = viewport.scrollHeight
                }
                const handleScroll = () => {
                    setIsAtBottom(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100)
                    if (viewport.scrollTop < 100 && hasMore && !isLoading && onLoadMore) {
                        onLoadMore()
                    }
                }
                viewport.addEventListener('scroll', handleScroll)
                return () => viewport.removeEventListener('scroll', handleScroll)
            }
        }
    }, [conversation.messages, isAtBottom, hasMore, isLoading, onLoadMore])

    const handleSend = () => {
        if (!message.trim()) return
        onSendMessage(message)
        setMessage("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={participant?.avatar} />
                        <AvatarFallback>{participant?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-sm font-semibold">{participant?.name || 'Unknown'}</h2>
                        {conversation.participants.length > 2 ? (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>{conversation.participants.length} members</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    participant?.status === "online" ? "bg-teal-500" : "bg-muted-foreground"
                                )} />
                                <span className="capitalize">{participant?.status || 'offline'}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-background/50 relative">
                <ScrollArea ref={scrollRef} className="h-full p-4">
                    <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4">
                        {isLoading && conversation.messages.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <span className="text-sm text-muted-foreground">Loading messages...</span>
                            </div>
                        ) : (
                            <>
                                {hasMore && (
                                    <div className="flex justify-center py-2">
                                        <span className="text-xs text-muted-foreground">Scroll up to load more</span>
                                    </div>
                                )}
                                {conversation.messages.map((msg) => {
                            const isMe = msg.senderId === currentUserId
                            const sender = isMe 
                                ? { name: 'You', avatar: undefined }
                                : (conversation.participants.find(p => p.id === msg.senderId) || { name: 'Unknown', avatar: undefined })
                            
                            return (
                                <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                    {!isMe && (
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={sender.avatar} />
                                            <AvatarFallback>{sender.name[0]}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "px-4 py-2 rounded-2xl text-sm",
                                            isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground px-1">
                                            {format(msg.timestamp, "h:mm a")}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <div className="p-4 bg-card border-t">
                <div className="max-w-3xl mx-auto flex gap-3 items-end">
                    <Button variant="outline" size="icon" className="shrink-0">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="min-h-[20px] max-h-[150px] resize-none"
                    />
                    <Button onClick={handleSend} size="icon" className="shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}