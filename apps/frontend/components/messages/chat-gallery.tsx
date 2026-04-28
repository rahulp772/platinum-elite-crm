"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ChatGalleryProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    images: { url: string; name: string }[]
    initialIndex?: number
}

export function ChatGallery({ open, onOpenChange, images, initialIndex = 0 }: ChatGalleryProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex)

    React.useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex)
        }
    }, [open, initialIndex])

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === "ArrowRight") nextImage()
            if (e.key === "ArrowLeft") prevImage()
            if (e.key === "Escape") onOpenChange(false)
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, images.length])

    if (images.length === 0) return null

    const currentImage = images[currentIndex]
    const imageUrl = currentImage.url.startsWith('http')
        ? currentImage.url
        : `${process.env.NEXT_PUBLIC_API_URL}${currentImage.url}`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none w-screen h-screen p-0 border-none bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between overflow-hidden shadow-2xl z-[9999]">
                <DialogHeader className="sr-only">
                    <DialogTitle>Image Gallery</DialogTitle>
                    <DialogDescription>Viewing chat images</DialogDescription>
                </DialogHeader>

                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-[60]">
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm truncate max-w-[300px]">{currentImage.name}</span>
                        <span className="text-white/50 text-[10px] uppercase tracking-widest">Image {currentIndex + 1} of {images.length}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href={imageUrl}
                            download={currentImage.name}
                            className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <Download className="h-5 w-5" />
                        </a>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                        >
                            <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
                        </button>
                    </div>
                </div>

                <div className="relative w-full h-full flex flex-col items-center justify-center">
                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-6 z-50 p-4 text-white/30 hover:text-white transition-all transform active:scale-95 hover:bg-white/5 rounded-full"
                            >
                                <ChevronLeft className="h-10 w-10 stroke-[1.5px]" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-6 z-50 p-4 text-white/30 hover:text-white transition-all transform active:scale-95 hover:bg-white/5 rounded-full"
                            >
                                <ChevronRight className="h-10 w-10 stroke-[1.5px]" />
                            </button>
                        </>
                    )}

                    {/* Main Image */}
                    <div className="relative w-full h-full flex items-center justify-center p-8 pt-20 pb-32">
                        <div className="relative w-full h-full animate-in fade-in zoom-in-95 duration-300">
                            <Image
                                src={imageUrl}
                                alt={currentImage.name}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10 p-4 pb-8">
                            <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 scrollbar-hide max-w-5xl mx-auto">
                                {images.map((img, idx) => {
                                    const thumbUrl = img.url.startsWith('http')
                                        ? img.url
                                        : `${process.env.NEXT_PUBLIC_API_URL}${img.url}`
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={cn(
                                                "relative flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-300 border-2",
                                                currentIndex === idx
                                                    ? "border-realty-gold scale-110 shadow-[0_0_20px_rgba(212,175,55,0.3)] z-10"
                                                    : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
                                            )}
                                        >
                                            <Image
                                                src={thumbUrl}
                                                alt={`Thumbnail ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
