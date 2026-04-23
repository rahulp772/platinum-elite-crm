"use client"

import * as React from "react"
import { Conversation, Message } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Video, MoreHorizontal, Send, Paperclip, Search } from "lucide-react"
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
    const [showDetails, setShowDetails] = React.useState(false)
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
        <div className="flex h-full overflow-hidden">
            <div className="flex flex-col flex-1 min-w-0 bg-background">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="ring-2 ring-realty-gold/20 ring-offset-2 ring-offset-background h-10 w-10">
                                <AvatarImage src={participant?.avatar} />
                                <AvatarFallback className="bg-realty-navy text-realty-gold font-bold">
                                    {participant?.name?.[0] || '?'}
                                </AvatarFallback>
                            </Avatar>
                            {participant?.status === "online" && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-teal-500 border-2 border-background" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground leading-none mb-1">{participant?.name || 'Unknown'}</h2>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                {participant?.status === "online" ? (
                                    <span className="text-teal-500 font-bold">Online Now</span>
                                ) : (
                                    <span>Last seen recently</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                            <Video className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowDetails(!showDetails)}
                            className={cn(
                                "text-muted-foreground transition-all",
                                showDetails ? "text-realty-gold bg-realty-gold/10" : "hover:text-primary hover:bg-primary/10"
                            )}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 min-h-0 relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-realty-gold/5 blur-[120px]" />
                        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-realty-navy/5 blur-[120px]" />
                    </div>

                    <ScrollArea ref={scrollRef} className="h-full">
                        <div className="flex flex-col gap-2 p-6 max-w-4xl mx-auto">
                            {isLoading && conversation.messages.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 rounded-full border-2 border-realty-gold border-t-transparent animate-spin" />
                                        <span className="text-xs font-medium text-muted-foreground">Loading messages...</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {hasMore && (
                                        <div className="flex justify-center py-4">
                                            <Button variant="ghost" size="sm" onClick={onLoadMore} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-realty-gold">
                                                Load older messages
                                            </Button>
                                        </div>
                                    )}
                                    {conversation.messages.map((msg, index) => {
                                        const isMe = msg.senderId === currentUserId
                                        const prevMsg = conversation.messages[index - 1]
                                        const nextMsg = conversation.messages[index + 1]
                                        
                                        const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || (msg.timestamp.getTime() - prevMsg.timestamp.getTime() > 300000)
                                        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || (nextMsg.timestamp.getTime() - msg.timestamp.getTime() > 300000)
                                        
                                        const sender = isMe 
                                            ? { name: 'You', avatar: undefined }
                                            : (conversation.participants.find(p => p.id === msg.senderId) || { name: 'Unknown', avatar: undefined })
                                        
                                        return (
                                            <div key={msg.id} className={cn(
                                                "flex flex-col gap-1 w-full",
                                                isMe ? "items-end" : "items-start",
                                                isFirstInGroup && "mt-4"
                                            )}>
                                                {isFirstInGroup && !isMe && (
                                                    <span className="text-[10px] font-bold text-muted-foreground px-2 mb-1 uppercase tracking-tight">
                                                        {sender.name}
                                                    </span>
                                                )}
                                                <div className={cn(
                                                    "flex gap-2 max-w-[75%] group items-end",
                                                    isMe ? "flex-row-reverse" : ""
                                                )}>
                                                    {!isMe && (
                                                        <div className="w-8 shrink-0">
                                                            {isLastInGroup && (
                                                                <Avatar className="h-8 w-8 ring-1 ring-border">
                                                                    <AvatarImage src={sender.avatar} />
                                                                    <AvatarFallback className="text-[10px] bg-muted">{sender.name[0]}</AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
                                                        <div className={cn(
                                                            "px-4 py-2.5 text-sm shadow-sm transition-all duration-200",
                                                            isMe 
                                                                ? "bg-gradient-to-br from-realty-gold to-[#B8860B] text-white rounded-2xl rounded-tr-sm group-hover:shadow-md group-hover:shadow-realty-gold/10" 
                                                                : "bg-card border border-border/50 text-foreground rounded-2xl rounded-tl-sm group-hover:border-realty-gold/30"
                                                        )}>
                                                            {msg.content}
                                                        </div>
                                                        {isLastInGroup && (
                                                            <span className="text-[9px] font-medium text-muted-foreground/60 px-1 uppercase">
                                                                {format(msg.timestamp, "h:mm a")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="p-4 bg-card/30 backdrop-blur-xl border-t border-border/50">
                    <div className="max-w-4xl mx-auto flex gap-3 items-end">
                        <div className="flex gap-1 shrink-0 pb-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-realty-gold hover:bg-realty-gold/10">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 relative">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                className="min-h-[44px] max-h-[120px] py-3 px-4 resize-none bg-background/50 border-border/50 focus:border-realty-gold/50 focus:ring-realty-gold/20 rounded-2xl transition-all text-sm scrollbar-none"
                            />
                        </div>
                        <Button 
                            onClick={handleSend} 
                            size="icon" 
                            disabled={!message.trim()}
                            className={cn(
                                "shrink-0 h-11 w-11 rounded-2xl shadow-lg transition-all active:scale-95",
                                message.trim() 
                                    ? "bg-realty-gold text-realty-navy hover:bg-realty-gold-light shadow-realty-gold/20" 
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Details Sidebar */}
            {showDetails && (
                <div className="w-80 border-l border-border/50 bg-card/20 backdrop-blur-xl flex flex-col h-full animate-in slide-in-from-right duration-300">
                    <div className="p-6 flex flex-col items-center text-center border-b border-border/50 bg-gradient-to-b from-realty-gold/5 to-transparent">
                        <Avatar className="h-24 w-24 ring-4 ring-realty-gold/10 ring-offset-4 ring-offset-background mb-4">
                            <AvatarImage src={participant?.avatar} />
                            <AvatarFallback className="text-2xl bg-realty-navy text-realty-gold font-bold">
                                {participant?.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg text-foreground tracking-tight">{participant?.name}</h3>
                        <p className="text-xs font-medium text-realty-gold uppercase tracking-[0.2em] mt-1">Contact Details</p>
                    </div>
                    
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-8">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-2">Information</h4>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Email Address</span>
                                        <span className="text-sm font-medium">{participant?.email || 'Not shared'}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Role</span>
                                        <span className="text-sm font-medium">Team Member</span>
                                    </div>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-2">Settings</h4>
                                <div className="grid gap-2">
                                    <Button variant="outline" className="justify-start gap-3 border-border/50 hover:bg-muted/50 text-xs h-10">
                                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                                        Search in chat
                                    </Button>
                                    <Button variant="outline" className="justify-start gap-3 border-border/50 hover:bg-muted/50 text-xs h-10 text-red-500 hover:text-red-600">
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                        Mute Notifications
                                    </Button>
                                </div>
                            </div>

                            {/* Shared Media Placeholder */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-2">Shared Photos</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="aspect-square rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center">
                                            <Paperclip className="h-4 w-4 text-muted-foreground/30" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}