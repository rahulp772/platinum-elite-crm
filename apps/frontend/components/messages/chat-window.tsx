"use client"

import * as React from "react"
import { Conversation, Message } from "@/types/chat"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Video, MoreHorizontal, Send, Paperclip, Search, X, FileIcon, Download, Loader2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTimeOnly, getUserTimezone, getDateLabel, formatDateOnly } from "@/lib/date-utils"
import { chatApi } from "@/lib/api-chat"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { ChatGallery } from "./chat-gallery"

interface ChatWindowProps {
    conversation: Conversation
    onSendMessage: (content: string, attachments?: any[]) => void
    currentUserId: string
    isLoading?: boolean
    hasMore?: boolean
    onLoadMore?: () => void
    showDetailsOnMobile?: boolean
    onBack?: () => void
}

function getOtherParticipant(conv: Conversation, currentUserId: string): { name: string; email?: string; avatar?: string; status: "online" | "offline" | "away" } {
    if (conv.participants.length > 2) {
        return {
            name: `Group (${conv.participants.length})`,
            email: undefined,
            avatar: undefined,
            status: "offline" as const,
        }
    }
    const other = conv.participants.find(p => p.id !== currentUserId) || conv.participants[0]
    return {
        name: other.name,
        email: other.email,
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
    showDetailsOnMobile = true,
    onBack,
}: ChatWindowProps) {
    const [message, setMessage] = React.useState("")
    const [showDetails, setShowDetails] = React.useState(showDetailsOnMobile)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const [isUploading, setIsUploading] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [isAtBottom, setIsAtBottom] = React.useState(true)

    const { user } = useAuth()
    const timezone = getUserTimezone(user)
    const [galleryOpen, setGalleryOpen] = React.useState(false)
    const [galleryInitialIndex, setGalleryInitialIndex] = React.useState(0)

    // Collect all images from the current conversation
    const allImages = React.useMemo(() => {
        const images: { url: string; name: string; messageId: string }[] = []
        conversation.messages.forEach(msg => {
            if (msg.attachments) {
                msg.attachments.forEach(att => {
                    if (att.type === 'image') {
                        images.push({
                            url: att.url,
                            name: att.name,
                            messageId: msg.id
                        })
                    }
                })
            }
        })
        // Since messages are oldest-to-newest, images are already in order
        return images
    }, [conversation.messages])

    const openImageInGallery = (url: string) => {
        const index = allImages.findIndex(img => img.url === url)
        if (index !== -1) {
            setGalleryInitialIndex(index)
            setGalleryOpen(true)
        }
    }

    const participant = getOtherParticipant(conversation, currentUserId)

    // Auto-focus on chat open
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [conversation.id])

    const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'auto') => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior })
            }
        }
    }, [])

    // Force scroll to bottom on conversation change
    React.useEffect(() => {
        setIsAtBottom(true)
        const timer = setTimeout(() => scrollToBottom('auto'), 50)
        return () => clearTimeout(timer)
    }, [conversation.id, scrollToBottom])

    // Handle incoming messages and scroll area height changes
    React.useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
                if (isAtBottom) {
                    viewport.scrollTop = viewport.scrollHeight
                }
                const handleScroll = () => {
                    const isBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100
                    setIsAtBottom(isBottom)

                    if (viewport.scrollTop < 100 && hasMore && !isLoading && onLoadMore) {
                        onLoadMore()
                    }
                }
                viewport.addEventListener('scroll', handleScroll)
                return () => viewport.removeEventListener('scroll', handleScroll)
            }
        }
    }, [conversation.messages, isAtBottom, hasMore, isLoading, onLoadMore])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...files])
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSend = async () => {
        if (!message.trim() && selectedFiles.length === 0) return

        let attachments: any[] = []

        if (selectedFiles.length > 0) {
            setIsUploading(true)
            try {
                const uploadPromises = selectedFiles.map(file => chatApi.uploadFile(file))
                attachments = await Promise.all(uploadPromises)
            } catch (error) {
                toast.error("Failed to upload files")
                setIsUploading(false)
                return
            }
            setIsUploading(false)
        }

        onSendMessage(message, attachments)
        setMessage("")
        setSelectedFiles([])
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
                <div className="flex-none shrink-0 flex items-center justify-between px-4 md:px-6 py-4 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        {/* Mobile Back Button */}
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="md:hidden flex items-center justify-center h-8 w-8 -ml-2 rounded-lg hover:bg-accent"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
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
                <div className="flex-1 min-h-0 relative overflow-hidden">
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

                                        const showDateSeparator = !prevMsg ||
                                            formatDateOnly(prevMsg.timestamp, timezone) !== formatDateOnly(msg.timestamp, timezone)

                                        const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId || (msg.timestamp.getTime() - prevMsg.timestamp.getTime() > 300000) || showDateSeparator
                                        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId || (nextMsg.timestamp.getTime() - msg.timestamp.getTime() > 300000)

                                        const sender = isMe
                                            ? { name: 'You', avatar: undefined }
                                            : (conversation.participants.find(p => p.id === msg.senderId) || { name: 'Unknown', avatar: undefined })

                                        return (
                                            <React.Fragment key={msg.id}>
                                                {showDateSeparator && (
                                                    <div className="flex items-center justify-center my-6">
                                                        <div className="flex-1 h-px bg-border/50" />
                                                        <span className="mx-4 px-3 py-1 rounded-full bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-widest ring-1 ring-border/50 backdrop-blur-sm">
                                                            {getDateLabel(msg.timestamp, timezone)}
                                                        </span>
                                                        <div className="flex-1 h-px bg-border/50" />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "flex flex-col gap-1 w-full",
                                                    isMe ? "items-end" : "items-start",
                                                    isFirstInGroup && "mt-1"
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
                                                                "transition-all duration-300",
                                                                msg.content
                                                                    ? (isMe
                                                                        ? "px-4 py-2.5 text-sm bg-gradient-to-br from-realty-gold to-[#B8860B] text-white rounded-2xl rounded-tr-sm shadow-sm hover:shadow-md hover:shadow-realty-gold/20"
                                                                        : "px-4 py-2.5 text-sm bg-card border border-border/50 text-foreground rounded-2xl rounded-tl-sm shadow-sm hover:border-realty-gold/30")
                                                                    : "rounded-2xl overflow-hidden"
                                                            )}>
                                                                {msg.content}

                                                                {msg.attachments && msg.attachments.length > 0 && (
                                                                    <div className={cn(
                                                                        msg.content ? "mt-3 border-t border-white/10 pt-3" : "",
                                                                        "flex flex-col gap-2",
                                                                        msg.attachments.filter(a => a.type === 'image').length > 1 ? "grid grid-cols-2" : "flex"
                                                                    )}>
                                                                        {msg.attachments.map((att, i) => (
                                                                            <div key={i} className={cn(
                                                                                "group/att relative rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl ring-1 ring-white/5",
                                                                                att.type === 'image' ? "aspect-auto" : "w-full"
                                                                            )}>
                                                                                {att.type === 'image' ? (
                                                                                    <div className="relative group/img overflow-hidden cursor-pointer" onClick={() => openImageInGallery(att.url)}>
                                                                                        <img
                                                                                            src={att.url.startsWith('http') ? att.url : `${process.env.NEXT_PUBLIC_API_URL}${att.url}`}
                                                                                            alt={att.name}
                                                                                            className="w-full h-full object-cover rounded-xl transition-all duration-700 group-hover/img:scale-110"
                                                                                        />
                                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-end justify-between p-3">
                                                                                            <div className="flex flex-col gap-0.5">
                                                                                                <span className="text-[10px] text-white/90 font-bold truncate max-w-[120px]">{att.name}</span>
                                                                                                <span className="text-[8px] text-white/60 font-medium uppercase">{(att.size / 1024).toFixed(1)} KB</span>
                                                                                            </div>
                                                                                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/40 transition-colors">
                                                                                                <Download className="h-3.5 w-3.5 text-white" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <a
                                                                                        href={att.url.startsWith('http') ? att.url : `${process.env.NEXT_PUBLIC_API_URL}${att.url}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className={cn(
                                                                                            "flex items-center gap-3 p-3 rounded-xl transition-colors",
                                                                                            isMe ? "bg-white/10 hover:bg-white/20" : "bg-muted/50 hover:bg-muted"
                                                                                        )}
                                                                                    >
                                                                                        <div className={cn(
                                                                                            "h-10 w-10 rounded-lg flex items-center justify-center",
                                                                                            isMe ? "bg-white/20" : "bg-realty-gold/10"
                                                                                        )}>
                                                                                            <FileIcon className={cn("h-5 w-5", isMe ? "text-white" : "text-realty-gold")} />
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className={cn("text-xs font-bold truncate", isMe ? "text-white" : "text-foreground")}>{att.name}</p>
                                                                                            <p className={cn("text-[10px]", isMe ? "text-white/60" : "text-muted-foreground")}>{(att.size / 1024).toFixed(1)} KB • PDF Document</p>
                                                                                        </div>
                                                                                        <Download className={cn("h-4 w-4 shrink-0", isMe ? "text-white/40" : "text-muted-foreground/40")} />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {isLastInGroup && (
                                                                <span className="text-[9px] font-medium text-muted-foreground/60 px-1 uppercase">
                                                                    {formatTimeOnly(msg.timestamp, timezone)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="flex-none shrink-0 p-4 bg-card/30 backdrop-blur-xl border-t border-border/50">
                    <div className="max-w-4xl mx-auto flex flex-col gap-3">
                        {/* Selected Files Preview */}
                        {selectedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-2xl bg-realty-navy/5 border border-realty-gold/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                                {selectedFiles.map((file, i) => (
                                    <div key={i} className="relative group bg-card border border-border/50 rounded-2xl p-2.5 pr-10 flex items-center gap-3 shadow-xl hover:border-realty-gold/30 transition-all duration-300 max-w-[240px]">
                                        <div className="h-10 w-10 rounded-xl bg-realty-gold/10 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-realty-gold/20">
                                            {file.type.includes('image') ? (
                                                <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" />
                                            ) : (
                                                <FileIcon className="h-5 w-5 text-realty-gold" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold truncate text-foreground leading-tight">{file.name}</p>
                                            <p className="text-[9px] font-medium text-realty-gold/60 uppercase tracking-wider">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button
                                            onClick={() => removeFile(i)}
                                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center justify-center h-12 w-12 rounded-2xl border-2 border-dashed border-realty-gold/20 text-realty-gold/40 hover:border-realty-gold/40 hover:text-realty-gold/60 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-5 w-5" />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 items-end">
                            <div className="flex gap-1 shrink-0 pb-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    multiple
                                    accept="image/*,.pdf"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-9 w-9 text-muted-foreground hover:text-realty-gold hover:bg-realty-gold/10"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex-1 relative">
                                <Textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message..."
                                    className="min-h-[48px] max-h-[160px] py-3.5 px-5 resize-none bg-background/80 border-realty-gold/10 focus:border-realty-gold/50 focus:ring-realty-gold/20 rounded-[24px] shadow-inner transition-all text-sm scrollbar-none leading-relaxed"
                                />
                            </div>
                            <Button
                                onClick={handleSend}
                                size="icon"
                                disabled={(!message.trim() && selectedFiles.length === 0) || isUploading}
                                className={cn(
                                    "shrink-0 h-11 w-11 rounded-2xl shadow-lg transition-all active:scale-95",
                                    (message.trim() || selectedFiles.length > 0) && !isUploading
                                        ? "bg-realty-gold text-realty-navy hover:bg-realty-gold-light shadow-realty-gold/20"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <ChatGallery
                    open={galleryOpen}
                    onOpenChange={setGalleryOpen}
                    images={allImages}
                    initialIndex={galleryInitialIndex}
                />
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