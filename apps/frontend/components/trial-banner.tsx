"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import api from "@/lib/api"

interface SubscriptionStatus {
  isTrial: boolean
  isTrialExpired: boolean
  daysSinceExpiry: number
  trialEndDate: string
  planName?: string
  subscriptionStatus?: string
  isOnHighestPlan?: boolean
}

export function TrialBanner() {
  const router = useRouter()
  const [status, setStatus] = React.useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/auth/subscription')
      setStatus(response.data)
    } catch (error) {
      console.error('Failed to fetch subscription status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return null
  }

  if (status?.isOnHighestPlan) {
    return null
  }

  if (!status?.isTrial) {
    return null
  }

  const showBlocker = status.isTrialExpired && status.daysSinceExpiry > 3
  const showWarning = status.isTrialExpired && status.daysSinceExpiry <= 3

  if (showBlocker) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Trial Expired</h2>
          <p className="text-muted-foreground mb-6">
            Your 7-day trial has ended. Please upgrade to continue using MakeItCRM.
          </p>
          <Button
            onClick={() => router.push('/pricing')}
            className="bg-gradient-to-r from-realty-gold to-realty-gold-dark text-realty-navy font-semibold"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    )
  }

  if (showWarning) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-500 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Your trial expired {status.daysSinceExpiry} days ago.{' '}
            <button
              onClick={() => router.push('/pricing')}
              className="underline hover:text-amber-400"
            >
              Upgrade now
            </button>
          </span>
        </div>
      </div>
    )
  }

  return null
}