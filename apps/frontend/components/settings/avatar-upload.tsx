"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { setCookie, getCookie, COOKIE_NAMES } from "@/lib/auth-cookies"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"

interface AvatarUploadProps {
    onUploadComplete?: (avatarUrl: string) => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export function AvatarUpload({ onUploadComplete }: AvatarUploadProps) {
    const router = useRouter()
    const { user, setUser } = useAuth()
    const [isUploading, setIsUploading] = React.useState(false)
    const [showCropModal, setShowCropModal] = React.useState(false)
    const [imgSrc, setImgSrc] = React.useState<string>('')
    const [crop, setCrop] = React.useState<Crop>()
    const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>()
    const imgRef = React.useRef<HTMLImageElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setImgSrc(reader.result as string)
            setShowCropModal(true)
        }
        reader.readAsDataURL(file)
    }

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, 1))
    }

    const getCroppedImage = async (): Promise<Blob | null> => {
        if (!completedCrop || !imgRef.current || !canvasRef.current) return null

        const image = imgRef.current
        const canvas = canvasRef.current
        const crop = completedCrop

        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        const outputSize = 400
        canvas.width = outputSize
        canvas.height = outputSize

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            outputSize,
            outputSize,
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/jpeg', 0.95)
        })
    }

    const handleCropSave = async () => {
        setIsUploading(true)
        try {
            const croppedBlob = await getCroppedImage()
            if (!croppedBlob) {
                throw new Error('Failed to crop image')
            }

            const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
            
            const formData = new FormData()
            formData.append('file', file)

            const response = await api.post('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            const avatarUrl = response.data.avatarUrl

            if (setUser && user) {
                const userWithAvatar = { ...user, avatar: avatarUrl }
                setUser(userWithAvatar)
                setCookie(COOKIE_NAMES.USER, JSON.stringify(userWithAvatar))
            }

            if (onUploadComplete) {
                onUploadComplete(avatarUrl)
            }

            toast.success('Avatar updated successfully')
            router.refresh()
        } catch (error: any) {
            console.error('Avatar upload error:', error)
            toast.error(error.response?.data?.message || 'Failed to upload avatar')
        } finally {
            setIsUploading(false)
            setShowCropModal(false)
            setImgSrc('')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleCropCancel = () => {
        setShowCropModal(false)
        setImgSrc('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const avatarSrc = user?.avatar || undefined
    const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'U'

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={avatarSrc} alt={user?.name} />
                    <AvatarFallback className="text-lg bg-muted">{initials}</AvatarFallback>
                </Avatar>
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-realty-gold" />
                    </div>
                )}
            </div>
            <div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="hidden"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    {user?.avatar ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, GIF. Max 2MB
                </p>
            </div>

            <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crop Photo</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                        {imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop={false}
                                className="max-h-[400px]"
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop preview"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    className="max-h-[400px] object-contain"
                                />
                            </ReactCrop>
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" onClick={handleCropCancel}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCropSave}
                                disabled={isUploading}
                                className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}