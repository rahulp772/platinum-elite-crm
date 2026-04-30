"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, List } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LeadsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Leads page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Failed to load leads</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || 'An error occurred while fetching leads data.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline"
          onClick={() => reset()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button 
          asChild
          variant="ghost"
        >
          <Link href="/" className="gap-2">
            <List className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}