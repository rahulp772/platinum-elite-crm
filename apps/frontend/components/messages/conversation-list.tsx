"use client"

import * as React from "react"
import { Conversation } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

    const filtered = conversations.filter(c => {
        const participant = getDisplayParticipant(c, currentUserId)
        return participant?.name?.toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className="flex flex-col h-full border-r bg-muted/10 w-80 min-w-[320px]">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {filtered.map((conv) => {
                        const isSelected = selectedId === conv.id
                        const participant = getDisplayParticipant(conv, currentUserId)
                        const lastMsg = conv.lastMessage
                        
                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted",
                                    isSelected && "bg-muted"
                                )}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={participant?.avatar} />
                                        <AvatarFallback>{participant?.name?.[0] || '?'}</AvatarFallback>
                                    </Avatar>
                                    {participant?.status === "online" && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-teal-500 border-2 border-background" />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">{participant?.name || 'Unknown'}</span>
                                        {lastMsg && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(lastMsg.timestamp, { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    {lastMsg && (
                                        <p className={cn(
                                            "text-xs truncate mt-1",
                                            conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                        )}>
                                            {lastMsg.senderId === currentUserId && "You: "}
                                            {lastMsg.content}
                                        </p>
                                    )}
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}