import { useState, useEffect, useCallback, useRef } from "react"
import api from "@/lib/api"

export interface ImportProgress {
    id: string
    status: 'pending' | 'validating' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
    totalRows: number
    processedRows: number
    successCount: number
    errorCount: number
    currentBatch: number
    totalBatches: number
    startedAt?: string
    completedAt?: string
    errors?: { row: number; field?: string; message: string; originalValue?: string }[]
    estimatedTimeRemaining?: number
}

export function useImportStatus() {
    const [progress, setProgress] = useState<ImportProgress | null>(null)
    const [isPolling, setIsPolling] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const startPolling = useCallback(async (sessionId: string) => {
        setIsPolling(true)
        setError(null)

        abortControllerRef.current = new AbortController()

        const pollStatus = async () => {
            try {
                const response = await api.get(`/leads/import/status/${sessionId}`, {
                    signal: abortControllerRef.current?.signal
                })
                setProgress(response.data)
                
                if (response.data.status === 'completed' || 
                    response.data.status === 'failed' || 
                    response.data.status === 'cancelled') {
                    stopPolling()
                }
            } catch (err: any) {
                // Ignore abort errors (expected when cancelling or completing)
                if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
                    return
                }
                console.error('Error polling import status:', err)
                setError(err.message || 'Failed to get import status')
            }
        }

        pollingRef.current = setInterval(pollStatus, 2000)
        await pollStatus()
    }, [])

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsPolling(false)
    }, [])

    const cancelImport = useCallback(async (sessionId: string) => {
        try {
            const response = await api.post(`/leads/import/cancel/${sessionId}`)
            stopPolling()
            return response.data
        } catch (err: any) {
            throw new Error(err.message || 'Failed to cancel import')
        }
    }, [stopPolling])

    const reset = useCallback(() => {
        stopPolling()
        setProgress(null)
        setError(null)
    }, [stopPolling])

    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    return {
        progress,
        isPolling,
        error,
        startPolling,
        stopPolling,
        cancelImport,
        reset,
    }
}