"use client"

import * as React from "react"
import { Conversation } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { formatRelativeTime, getUserTimezone } from "@/lib/date-utils"
import { useAuth } from "@/lib/auth-context"

interface ConversationListProps {
    conversations: Conversation[]
    selectedId?: string
    onSelect: (id: string) => void
    currentUserId: string
}

function getOtherParticipant(conv: Conversation, currentUserId: string) {
    if (conv.groupName) {
        return {
            name: conv.groupName,
            avatar: undefined,
            status: "offline" as const,
        }
    }
    const other = conv.participants.find(p => p.id !== currentUserId)
    return other || conv.participants[0]
}

function getDisplayParticipant(conv: Conversation, currentUserId: string) {
    if (conv.participants.length > 2) {
        return {
            name: `Group (${conv.participants.length})`,
            avatar: undefined,
            status: "offline" as const,
        }
    }
    const other = conv.participants.find(p => p.id !== currentUserId)
    return other || conv.participants[0]
}

export function ConversationList({ conversations, selectedId, onSelect, currentUserId }: ConversationListProps) {
    const [search, setSearch] = React.useState("")
    const { user } = useAuth()
    const timezone = getUserTimezone(user)

    const filtered = conversations.filter(c => {
        const participant = getDisplayParticipant(c, currentUserId)
        return participant?.name?.toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className="flex flex-col h-full border-r border-border/50 bg-card/10">
            <div className="p-4 space-y-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-realty-gold" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-10 bg-background/50 border-border/50 focus:border-realty-gold/50 focus:ring-realty-gold/20 rounded-xl transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-3">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <p className="text-xs text-muted-foreground font-medium">No conversations found</p>
                        </div>
                    ) : (
                        filtered.map((conv) => {
                            const isSelected = selectedId === conv.id
                            const participant = getDisplayParticipant(conv, currentUserId)
                            const lastMsg = conv.lastMessage
                            
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelect(conv.id)}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-200 group relative overflow-hidden",
                                        isSelected 
                                            ? "bg-gradient-to-r from-realty-gold/20 to-transparent border border-realty-gold/10 shadow-sm" 
                                            : "hover:bg-accent/50 border border-transparent"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-realty-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                                    )}
                                    
                                    <div className="relative shrink-0">
                                        <Avatar className={cn(
                                            "ring-2 ring-transparent transition-all h-11 w-11",
                                            isSelected ? "ring-realty-gold/30" : "group-hover:ring-border"
                                        )}>
                                            <AvatarImage src={participant?.avatar} />
                                            <AvatarFallback className="bg-realty-navy text-realty-gold font-bold">
                                                {participant?.name?.[0] || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {participant?.status === "online" && (
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-background shadow-sm" />
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-hidden min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn(
                                                "font-bold text-sm truncate",
                                                isSelected ? "text-foreground" : "text-foreground/90"
                                            )}>
                                                {participant?.name || 'Unknown'}
                                            </span>
                                            {lastMsg && (
                                                <span className="text-[10px] font-medium text-muted-foreground/70 uppercase">
                                                    {formatRelativeTime(lastMsg.timestamp, timezone)}
                                                </span>
                                            )}
                                        </div>
                                        {lastMsg ? (
                                            <p className={cn(
                                                "text-xs truncate transition-colors",
                                                conv.unreadCount > 0 
                                                    ? "font-bold text-realty-gold-light" 
                                                    : "text-muted-foreground font-medium"
                                            )}>
                                                {lastMsg.senderId === currentUserId && (
                                                    <span className="text-[10px] font-bold text-muted-foreground/50 mr-1 uppercase">You:</span>
                                                )}
                                                {lastMsg.content || (lastMsg.attachments?.length ? "Sent an attachment" : "Message")}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground/50 italic">New conversation</p>
                                        )}
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-realty-gold px-1.5 text-[10px] font-bold text-realty-navy shadow-lg shadow-realty-gold/20">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </button>
                            )
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}