"use client"

import React, { useRef } from "react"
import { Check, X, AlertCircle, Loader2, Download, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useImportStatus, ImportProgress } from "@/hooks/use-import-status"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/api"

interface ImportProgressDashboardProps {
    sessionId: string
    onComplete?: (result: ImportProgress) => void
    onCancel?: () => void
}

export function ImportProgressDashboard({ sessionId, onComplete, onCancel }: ImportProgressDashboardProps) {
    const { progress, isPolling, error, startPolling, cancelImport, stopPolling } = useImportStatus()
    const [isCancelling, setIsCancelling] = React.useState(false)
    const hasCalledComplete = useRef(false)

    React.useEffect(() => {
        startPolling(sessionId)
        return () => {
            stopPolling()
        }
    }, [sessionId, startPolling, stopPolling])

    React.useEffect(() => {
        if (progress && (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'cancelled')) {
            if (!hasCalledComplete.current && onComplete) {
                hasCalledComplete.current = true
                onComplete(progress)
            }
        }
    }, [progress, onComplete])

    const handleCancel = async () => {
        setIsCancelling(true)
        try {
            await cancelImport(sessionId)
            toast.success("Import cancelled")
            if (onCancel) onCancel()
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel import")
        } finally {
            setIsCancelling(false)
        }
    }

    const handleDownloadReport = async () => {
        try {
            const response = await api.get(`/leads/import/report/${sessionId}`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `import_errors_${sessionId}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            toast.error("Failed to download error report")
        }
    }

    const handleGoToLeads = () => {
        window.location.href = '/leads'
    }

    const formatTime = (seconds?: number) => {
        if (!seconds) return '--'
        if (seconds < 60) return `${seconds}s`
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    }

    const getElapsedTime = () => {
        if (!progress?.startedAt) return '--'
        const start = new Date(progress.startedAt).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - start) / 1000)
        return formatTime(elapsed)
    }

    const percentage = progress 
        ? Math.round((progress.processedRows / Math.max(progress.totalRows, 1)) * 100)
        : 0

    if (error) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Error Getting Status</h3>
                    <p className="text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                            {progress?.status === 'completed' && "Import Completed"}
                            {progress?.status === 'processing' && "Importing..."}
                            {progress?.status === 'queued' && "Preparing..."}
                            {progress?.status === 'failed' && "Import Failed"}
                            {progress?.status === 'cancelled' && "Import Cancelled"}
                            {progress?.status === 'pending' && "Starting..."}
                        </h3>
                        {progress?.status === 'processing' && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleCancel}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <X className="h-4 w-4 mr-2" />
                                )}
                                Cancel
                            </Button>
                        )}
                    </div>
                    <Progress value={percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold">{progress?.totalRows || 0}</p>
                        <p className="text-xs text-muted-foreground font-medium">Total Rows</p>
                    </div>
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{progress?.successCount || 0}</p>
                        <p className="text-xs text-green-600 font-medium">Success</p>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{progress?.errorCount || 0}</p>
                        <p className="text-xs text-red-600 font-medium">Errors</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold">{getElapsedTime()}</p>
                        <p className="text-xs text-muted-foreground font-medium">Elapsed</p>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {progress?.processedRows || 0} of {progress?.totalRows || 0} rows processed
                    </span>
                    <span>
                        Batch {progress?.currentBatch || 0} of {progress?.totalBatches || 0}
                    </span>
                </div>

                {progress?.status === 'processing' && progress.estimatedTimeRemaining && (
                    <p className="text-sm text-center text-muted-foreground">
                        Estimated time remaining: {formatTime(progress.estimatedTimeRemaining)}
                    </p>
                )}

                {(progress?.status === 'completed' || progress?.status === 'failed' || progress?.status === 'cancelled') && (
                    <div className="space-y-3 pt-4 border-t">
                        {progress.status === 'completed' && (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <Check className="h-5 w-5" />
                                <span className="font-medium">Import completed successfully!</span>
                            </div>
                        )}
                        {progress.status === 'failed' && (
                            <div className="flex items-center justify-center gap-2 text-red-600">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-medium">Import failed. Please check the error report.</span>
                            </div>
                        )}
                        {progress.status === 'cancelled' && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <X className="h-5 w-5" />
                                <span className="font-medium">Import was cancelled.</span>
                            </div>
                        )}

                        <div className="flex justify-center gap-3">
                            {(progress.errorCount || 0) > 0 && (
                                <Button variant="outline" onClick={handleDownloadReport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Error Report
                                </Button>
                            )}
                            <Button onClick={handleGoToLeads}>
                                View Imported Leads
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}