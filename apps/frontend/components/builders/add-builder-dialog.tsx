"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateBuilder } from "@/hooks/use-builders"
import { toast } from "sonner"

interface AddBuilderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddBuilderDialog({ open, onOpenChange }: AddBuilderDialogProps) {
    const createBuilder = useCreateBuilder()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        
        const builderData = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            website: formData.get('website') as string,
            logo: "https://api.dicebear.com/7.x/initials/svg?seed=" + (formData.get('name') as string),
            foundedYear: Number(formData.get('foundedYear')) || undefined,
            headquarters: formData.get('headquarters') as string,
            totalProjects: Number(formData.get('totalProjects')) || 0,
            completedProjects: Number(formData.get('completedProjects')) || 0,
            ongoingProjects: Number(formData.get('ongoingProjects')) || 0,
        }

        try {
            await createBuilder.mutateAsync(builderData)
            toast.success("Builder created successfully")
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to create builder:", error)
            toast.error("Failed to create builder. Please try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Register New Builder</DialogTitle>
                    <DialogDescription>
                        Add a property developer to your network to link them with projects.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name *</Label>
                            <Input id="name" name="name" placeholder="E.g. Sobha Realty" required className="rounded-xl h-11" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input id="website" name="website" placeholder="https://..." className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="headquarters">Headquarters</Label>
                                <Input id="headquarters" name="headquarters" placeholder="City, Country" className="rounded-xl h-11" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="foundedYear">Founded Year</Label>
                                <Input id="foundedYear" name="foundedYear" type="number" placeholder="2005" className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalProjects">Total Projects</Label>
                                <Input id="totalProjects" name="totalProjects" type="number" defaultValue="0" className="rounded-xl h-11" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ongoingProjects">Ongoing Projects</Label>
                                <Input id="ongoingProjects" name="ongoingProjects" type="number" defaultValue="0" className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="completedProjects">Completed Projects</Label>
                                <Input id="completedProjects" name="completedProjects" type="number" defaultValue="0" className="rounded-xl h-11" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">About Company</Label>
                            <Textarea id="description" name="description" placeholder="Company overview, philosophy, and history..." className="resize-none rounded-xl" rows={4} />
                        </div>
                    </div>
                    <DialogFooter className="mt-6 gap-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-11">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createBuilder.isPending} className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light font-bold rounded-xl h-11 px-8">
                            {createBuilder.isPending ? "Registering..." : "Register Builder"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
