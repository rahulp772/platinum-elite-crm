"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  void reset

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
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
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}