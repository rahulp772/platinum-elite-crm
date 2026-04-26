"use client"

import * as React from "react"
import { PipelineBoard } from "@/components/leads/pipeline-board"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"

export default function PipelinePage() {
    const { user, isLoading } = useAuth()

    React.useEffect(() => {
        if (!isLoading && user && (user.role?.level ?? 100) < 50) {
            // Redirect regular agents back to leads or dashboard if they try to access pipeline
            redirect("/dashboard")
        }
    }, [user, isLoading])

    if (isLoading) return null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Lead Pipeline</h1>
                <p className="text-muted-foreground">
                    Drag and drop leads to update their stages.
                </p>
            </div>
            
            <PipelineBoard />
        </div>
    )
}
