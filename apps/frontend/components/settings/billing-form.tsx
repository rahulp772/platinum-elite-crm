"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, CreditCard, Calendar, ArrowRight, Receipt, Users, Building, AlertTriangle } from "lucide-react"
import { formatDateOnly } from "@/lib/date-utils"

interface Subscription {
  id: string
  planId: string
  billingCycle: string
  status: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  addOns: string[]
  autoRenew: boolean
  plan: {
    id: string
    displayName: string
    slug: string
    monthlyPrice: number
    yearlyPrice: number
    userLimit: number
    leadLimit: number
  }
}

interface Entitlements {
  planId: string
  planName: string
  planSlug: string
  userLimit: number
  leadLimit: number
  features: string[]
  addOns: string[]
  isUnlimited: boolean
  currentUsers: number
  currentLeads: number
}

interface Transaction {
  id: string
  type: string
  status: string
  amount: number
  currency: string
  planName: string | null
  description: string | null
  invoiceNumber: string | null
  createdAt: string
}

export function BillingForm() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const timezone = user?.timezone || 'Asia/Kolkata'

  const { data: subscription, isLoading: subLoading } = useQuery<Subscription>({
    queryKey: ['subscription', user?.tenantId],
    queryFn: async () => {
      const res = await api.get('/subscriptions/my')
      return res.data
    },
    enabled: !!user?.tenantId,
  })

  const { data: subStatus } = useQuery<any>({
    queryKey: ['subscriptionStatus', user?.tenantId],
    queryFn: async () => {
      const res = await api.get('/auth/subscription')
      return res.data
    },
    enabled: !!user?.tenantId,
  })

  const { data: entitlements, isLoading: entLoading } = useQuery<Entitlements>({
    queryKey: ['entitlements', user?.tenantId],
    queryFn: async () => {
      const res = await api.get('/entitlements/my')
      return res.data
    },
    enabled: !!user?.tenantId,
  })

  const { data: transactionsData, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', user?.tenantId],
    queryFn: async () => {
      try {
        const res = await api.get('/transactions')
        return res.data || []
      } catch {
        return []
      }
    },
    enabled: !!user?.tenantId,
  })

  const upgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await api.post('/subscriptions/upgrade', { planId })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.tenantId] })
      queryClient.invalidateQueries({ queryKey: ['entitlements', user?.tenantId] })
    },
  })

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/20">Failed</Badge>
      case 'refunded':
        return <Badge className="bg-gray-500/20 text-gray-500 hover:bg-gray-500/20">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'subscription': return 'Subscription'
      case 'upgrade': return 'Upgrade'
      case 'renewal': return 'Renewal'
      case 'refund': return 'Refund'
      default: return type
    }
  }

  const userUsagePercent = entitlements && !entitlements.isUnlimited
    ? Math.round((entitlements.currentUsers / entitlements.userLimit) * 100)
    : 0

  const leadUsagePercent = entitlements && !entitlements.isUnlimited
    ? Math.round((entitlements.currentLeads / entitlements.leadLimit) * 100)
    : 0

  const isNearLimit = userUsagePercent >= 80 || leadUsagePercent >= 80

  if (subLoading || entLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const daysRemaining = subscription?.currentPeriodEnd
    ? getDaysRemaining(subscription.currentPeriodEnd)
    : null

  return (
    <div className="space-y-6">
      {isNearLimit && (
        <Card className="border-realty-gold/30 bg-gradient-to-r from-realty-gold/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-realty-gold" />
              <CardTitle className="text-lg text-realty-gold">You're nearing your limit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {userUsagePercent >= 80 && `You've used ${entitlements?.currentUsers} of ${entitlements?.userLimit} user slots. `}
              {leadUsagePercent >= 80 && `You've used ${entitlements?.currentLeads} of ${entitlements?.leadLimit} leads.`}
              {' '}Consider upgrading your plan.
            </p>
            <Link href="/pricing">
              <Button size="sm" className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light">
                Upgrade Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your subscription details and resource usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-realty-gold/10 border border-realty-gold/30">
                <CreditCard className="h-6 w-6 text-realty-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {subscription?.plan?.displayName || subStatus?.planName || 'No Plan'}
                  </h3>
                  {(subscription || subStatus?.subscriptionStatus) && (
                    <Badge className={
                      subscription?.status === 'active' 
                        ? 'bg-green-500/20 text-green-500'
                        : subscription?.status === 'trial' || subStatus?.subscriptionStatus === 'trial'
                          ? 'bg-amber-500/20 text-amber-500'
                          : subscription?.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-500'
                            : subStatus?.subscriptionStatus === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-500'
                    }>
                      {subscription?.status || subStatus?.subscriptionStatus || 'Unknown'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription?.billingCycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}
                  {subscription?.autoRenew && ' • Auto-renew enabled'}
                  {!subscription && subStatus?.hasSubscription && ' • Active'}
                </p>
              </div>
            </div>

            <Link href="/pricing">
              <Button className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light">
                {subStatus?.hasSubscription ? 'Change Plan' : 'Choose Plan'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {entitlements && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Users</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {entitlements.currentUsers} / {entitlements.isUnlimited ? '∞' : entitlements.userLimit}
                </span>
              </div>
              <Progress 
                value={userUsagePercent} 
                className="h-2"
              />

              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Leads</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {entitlements.currentLeads.toLocaleString()} / {entitlements.isUnlimited ? '∞' : entitlements.leadLimit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={leadUsagePercent} 
                className="h-2"
              />
            </div>
          )}

          {subscription?.currentPeriodStart && (
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Period Start</p>
                  <p className="font-medium">
                    {formatDateOnly(subscription.currentPeriodStart, timezone)}
                  </p>
                </div>
                {subscription.currentPeriodEnd && (
                  <div>
                    <p className="text-muted-foreground">Current Period End</p>
                    <p className="font-medium">
                      {formatDateOnly(subscription.currentPeriodEnd, timezone)}
                    </p>
                  </div>
                )}
                {daysRemaining !== null && (
                  <div>
                    <p className="text-muted-foreground">Days Remaining</p>
                    <p className={`font-medium ${daysRemaining <= 7 ? 'text-amber-500' : ''}`}>
                      {daysRemaining}
                    </p>
                  </div>
                )}
                {subscription.plan && (
                  <div>
                    <p className="text-muted-foreground">Monthly Price</p>
                    <p className="font-medium">
                      ₹{Number(subscription.plan.monthlyPrice).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            View your recent billing transactions and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactionsData && transactionsData.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsData.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {formatDateOnly(tx.createdAt, timezone)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {tx.planName || getTypeLabel(tx.type)}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-muted-foreground">
                              {tx.description}
                            </p>
                          )}
                          {tx.invoiceNumber && (
                            <p className="text-xs text-muted-foreground">
                              {tx.invoiceNumber}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        ₹{Number(tx.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tx.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Your billing history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!subStatus?.isOnHighestPlan && (
        <Card className="bg-gradient-to-r from-realty-gold/5 to-transparent border-realty-gold/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="font-semibold mb-2">Need More Resources?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Upgrade to Team plan for 10 users and 50,000 leads, or Scale for unlimited.
              </p>
              <Link href="/pricing">
                <Button className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light">
                  View All Plans <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
