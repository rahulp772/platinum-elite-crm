"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorDisplayProps {
  title: string
  message: string
  reset?: () => void
  showHomeLink?: boolean
  showReportLink?: boolean
}

export function ErrorDisplay({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again.",
  reset,
  showHomeLink = true,
  showReportLink = false
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-6">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>

      <div className="flex gap-4">
        {reset && (
          <Button variant="outline" onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
        {showHomeLink && (
          <Button asChild variant="ghost">
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        )}
        {showReportLink && (
          <Button asChild variant="ghost">
            <Link href="/help" className="gap-2">
              <Mail className="h-4 w-4" />
              Report Issue
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorDisplay
          title="Something went wrong"
          message={this.state.error?.message || "An unexpected error occurred."}
          reset={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<T extends object>(
  ComponentToWrap: React.ComponentType<T>,
  errorProps?: Partial<ErrorDisplayProps>
) {
  return function WithErrorBoundary(props: T) {
    return (
      <ErrorBoundary
        fallback={
          <ErrorDisplay
            title={errorProps?.title || "Something went wrong"}
            message={errorProps?.message || "An unexpected error occurred."}
            reset={errorProps?.reset || (() => window.location.reload())}
            showHomeLink={errorProps?.showHomeLink}
            showReportLink={errorProps?.showReportLink}
          />
        }
      >
        <ComponentToWrap {...props} />
      </ErrorBoundary>
    )
  }
}