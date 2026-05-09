"use client"

import * as React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
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
import { Loader2, CreditCard, Calendar, ArrowRight, Receipt } from "lucide-react"
import { formatDateOnly } from "@/lib/date-utils"

interface SubscriptionStatus {
    planName: string | null
    planTier: number
    isTrial: boolean
    isTrialExpired: boolean
    isOnHighestPlan: boolean
    subscriptionStatus: string | null
    trialEndDate: string | null
    subscriptionStartDate: string | null
    subscriptionEndDate: string | null
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
    const timezone = user?.timezone || 'Asia/Kolkata'

    const { data: subscriptionData, isLoading: subLoading } = useQuery<SubscriptionStatus>({
        queryKey: ['subscription'],
        queryFn: async () => {
            const res = await api.get('/auth/subscription')
            return res.data
        },
    })

    const { data: transactionsData, isLoading: txLoading } = useQuery<Transaction[]>({
        queryKey: ['transactions'],
        queryFn: async () => {
            try {
                const res = await api.get('/transactions')
                return res.data || []
            } catch {
                return []
            }
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

    if (subLoading) {
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

    const daysRemaining = subscriptionData?.trialEndDate
        ? getDaysRemaining(subscriptionData.trialEndDate)
        : null

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Current Plan
                    </CardTitle>
                    <CardDescription>
                        Your subscription details and billing information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-realty-gold/10 border border-realty-gold/30">
                                <CreditCard className="h-6 w-6 text-realty-gold" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">
                                        {subscriptionData?.isTrial
                                            ? (subscriptionData?.planName ? `${subscriptionData.planName} Trial` : 'Free Trial')
                                            : (subscriptionData?.planName || 'No Plan')}
                                    </h3>
                                    {subscriptionData?.isOnHighestPlan && (
                                        <Badge className="bg-realty-gold text-realty-navy">PRO</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {subscriptionData?.subscriptionStatus || 'Active'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {subscriptionData?.isTrial && daysRemaining !== null && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className={daysRemaining > 0 ? "text-muted-foreground" : "text-red-500"}>
                                        {daysRemaining > 0
                                            ? `${daysRemaining} days remaining`
                                            : 'Trial expired'}
                                    </span>
                                </div>
                            )}
                            <Link href="/pricing">
                                <Button className="bg-realty-gold text-realty-navy hover:bg-realty-gold-light">
                                    {subscriptionData?.isTrial
                                        ? 'Activate Plan'
                                        : subscriptionData?.planName
                                            ? 'Change Plan'
                                            : 'Upgrade'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {subscriptionData?.subscriptionStartDate && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Start Date</p>
                                    <p className="font-medium">
                                        {formatDateOnly(subscriptionData.subscriptionStartDate, timezone)}
                                    </p>
                                </div>
                                {subscriptionData.subscriptionEndDate && (
                                    <div>
                                        <p className="text-muted-foreground">Next Billing</p>
                                        <p className="font-medium">
                                            {formatDateOnly(subscriptionData.subscriptionEndDate, timezone)}
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
                                                    {tx.invoiceNumber && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {tx.invoiceNumber}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {tx.currency} {tx.amount.toFixed(2)}
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
        </div>
    )
}