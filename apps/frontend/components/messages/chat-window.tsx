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
}

export function ChatWindow({ conversation, onSendMessage }: ChatWindowProps) {
    const [message, setMessage] = React.useState("")
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    React.useEffect(() => {
        if (scrollRef.current) {
            // Find the scrollable viewport inside Next.js ScrollArea logic or use a direct div if simpler.
            // Shadcn ScrollArea renders a viewport div.
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight
            }
        }
    }, [conversation.messages])

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
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={conversation.participant.avatar} />
                        <AvatarFallback>{conversation.participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-sm font-semibold">{conversation.participant.name}</h2>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className={cn(
                                "w-2 h-2 rounded-full",
                                conversation.participant.status === "online" ? "bg-teal-500" : "bg-muted-foreground"
                            )} />
                            <span className="capitalize">{conversation.participant.status}</span>
                        </div>
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

            {/* Messages */}
            <div className="flex-1 min-h-0 bg-background/50 relative">
                <ScrollArea ref={scrollRef} className="h-full p-4">
                    <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4">
                        {conversation.messages.map((msg, i) => {
                            const isMe = msg.senderId === "me"
                            return (
                                <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                    {!isMe && (
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={conversation.participant.avatar} />
                                            <AvatarFallback>{conversation.participant.name[0]}</AvatarFallback>
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
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
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
