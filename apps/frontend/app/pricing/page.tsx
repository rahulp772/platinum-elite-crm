"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Loader2, Check, ArrowLeft, Sparkles, CheckCircle2, RefreshCw, PartyPopper } from "lucide-react"
import api from "@/lib/api"

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  maxUsers: number
  maxProperties: number
  maxLeads: number
  features: string[]
  isPopular?: boolean
  level: number
}

interface SubscriptionStatus {
  isTrial: boolean
  planName: string
  subscriptionStatus: string
  planTier: number
  isOnHighestPlan: boolean
}



function PricingContent() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = React.useState<Plan[]>([
    { id: 'starter', name: 'Starter', description: 'Perfect for individual agents starting their journey.', monthlyPrice: 0, yearlyPrice: 0, maxUsers: 2, maxProperties: 10, maxLeads: 50, features: ['Up to 50 Leads', 'Basic CRM', 'Email Support', 'Mobile App Access', 'Up to 2 Users', 'Up to 10 Properties'], isPopular: false, level: 0 },
    { id: 'professional', name: 'Professional', description: 'Designed for high-performing teams and agencies.', monthlyPrice: 49, yearlyPrice: 470, maxUsers: 10, maxProperties: 100, maxLeads: 500, features: ['Up to 500 Leads', 'Advanced Analytics', 'Priority Support', 'Team Collaboration', 'Up to 10 Users', 'Custom Workflows', 'Up to 100 Properties'], isPopular: true, level: 1 },
    { id: 'enterprise', name: 'Enterprise', description: 'Custom solutions for large-scale real estate firms.', monthlyPrice: 149, yearlyPrice: 1430, maxUsers: -1, maxProperties: -1, maxLeads: -1, features: ['Unlimited Leads', 'White-label Branding', '24/7 Dedicated Support', 'API Access', 'Unlimited Users', 'Advanced Security', 'Unlimited Properties'], isPopular: false, level: 2 },
  ])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isPurchasing, setIsPurchasing] = React.useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubscriptionStatus | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [showWelcome, setShowWelcome] = React.useState(false)
  const [purchasedPlanName, setPurchasedPlanName] = React.useState('')
  const searchParams = useSearchParams()

  const refreshSubscription = async () => {
    try {
      const response = await api.get(`/auth/subscription?t=${Date.now()}`)
      setSubscriptionStatus(response.data)
    } catch (error) {
      console.error('Failed to refresh subscription:', error)
    }
  }

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await api.get('/plans')
        const plansData = plansRes.data
        if (Array.isArray(plansData) && plansData.length > 0) {
          setPlans(plansData.map((p: any) => ({ ...p })))
        }
        
        if (user?.tenantId) {
          const subRes = await api.get('/auth/subscription')
          setSubscriptionStatus(subRes.data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user?.tenantId, refreshKey])

  const currentPlanTier = subscriptionStatus?.planTier ?? -1
  const currentPlanName = subscriptionStatus?.isTrial ? 'Free Trial' : subscriptionStatus?.planName || 'None'
  const isOnTrial = subscriptionStatus?.isTrial

  const handlePurchase = async (planId: string) => {
    if (!user?.tenantId) {
      router.push('/login')
      return
    }

    const selectedPlan = plans.find(p => p.id.toLowerCase() === planId.toLowerCase())
    const planTier = selectedPlan ? selectedPlan.level : -1
    
    if (planTier <= currentPlanTier && currentPlanTier >= 0 && !isOnTrial) {
      return
    }

    setIsPurchasing(planId)
    try {
      const response = await api.patch(`/tenants/${user.tenantId}`, {
        planName: planId,
        subscriptionStatus: 'active',
        isTrial: false,
        subscriptionStartDate: new Date().toISOString(),
      })

      const updatedTenant = response.data
      if (user) {
        setUser({ ...user, tenant: updatedTenant })
      }
      
      const subRes = await api.get('/auth/subscription')
      const subData = subRes.data
      setSubscriptionStatus(subData)
      setPurchasedPlanName(subData.planName || planId)
      setShowWelcome(true)
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setIsPurchasing(null)
    }
  }

  const isPlanDisabled = (planTier: number) => {
    if (currentPlanTier < 0) return false
    if (isOnTrial) return planTier < currentPlanTier
    return planTier <= currentPlanTier
  }

  const getButtonText = (planId: string, planTier: number) => {
    const planKey = planId.toLowerCase()
    const currentPlanKey = subscriptionStatus?.planName?.toLowerCase()
    
    if (isOnTrial && planKey === currentPlanKey) {
      return 'Activate Plan'
    }
    if (currentPlanKey === planKey && !isOnTrial) {
      return 'Selected Plan'
    }
    if (planTier < currentPlanTier) {
      return 'Downgrade'
    }
    if (planTier > currentPlanTier) {
      return 'Upgrade'
    }
    return 'Select Plan'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-realty-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">Transparent Pricing for <span className="text-[#D4AF37]">Elite Performance</span></h1>
            <p className="text-muted-foreground text-lg mt-2">Choose the plan that fits your business scale. No hidden fees, just pure growth.</p>
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          7-day free trial on all plans
        </div>

        {subscriptionStatus && (
          <div className="mt-8 mb-8 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${subscriptionStatus.isTrial ? 'bg-amber-500/20' : 'bg-realty-gold/20'}`}>
                  {subscriptionStatus.isTrial ? (
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-realty-gold" />
                  )}
                </div>
                <div>
                  <p className="text-foreground font-medium">Current Plan: <span className="text-realty-gold font-bold">{currentPlanName}</span></p>
                  <p className="text-muted-foreground text-sm">
                    {subscriptionStatus.isTrial 
                      ? `Trial ends ${subscriptionStatus.planName ? '' : '(no end date set)'}`
                      : subscriptionStatus.subscriptionStatus || 'Active'
                    }
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshSubscription} className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mt-16">
          {plans.map((plan, i) => {
            const isCurrentPlan = subscriptionStatus?.planName?.toLowerCase() === plan.id.toLowerCase() && !subscriptionStatus.isTrial
            const isDisabled = isPlanDisabled(plan.level)
            const buttonText = getButtonText(plan.id, plan.level)
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-10 rounded-[32px] border ${
                  plan.isPopular 
                    ? "bg-slate-900 border-[#D4AF37] shadow-[0_20px_50px_rgba(212,175,55,0.15)]" 
                    : isCurrentPlan
                      ? "bg-realty-gold/5 border-realty-gold"
                      : "bg-card border-border"
                } ${isDisabled ? 'opacity-60' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-realty-gold text-slate-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Current
                  </div>
                )}
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.isPopular ? "text-white" : isCurrentPlan ? "text-realty-gold" : "text-foreground"}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${plan.isPopular ? "text-[#D4AF37]" : isCurrentPlan ? "text-realty-gold" : "text-foreground"}`}>
                      ${plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {plan.monthlyPrice === 0 ? 'Free' : '/month'}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${plan.isPopular ? "bg-[#D4AF37]/20" : isCurrentPlan ? "bg-realty-gold/20" : "bg-accent"}`}>
                        <Check className={`h-3 w-3 ${plan.isPopular ? "text-[#D4AF37]" : isCurrentPlan ? "text-realty-gold" : "text-primary"}`} />
                      </div>
                      <span className={`text-sm ${plan.isPopular ? "text-slate-300" : isCurrentPlan ? "text-foreground" : "text-muted-foreground"}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${
                    plan.isPopular 
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 hover:scale-[1.02] shadow-lg shadow-[#D4AF37]/20" 
                      : isCurrentPlan
                        ? "bg-realty-gold text-slate-950 font-semibold"
                        : "bg-accent hover:bg-accent/80 text-foreground"
                  } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                  onClick={() => handlePurchase(plan.id)}
                  disabled={isDisabled || isPurchasing === plan.id}
                >
                  {isPurchasing === plan.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {buttonText}
                </Button>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-lg">Questions? Contact us at support@makeitcrm.com</p>
        </div>
      </div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-realty-gold/20 to-realty-gold/10 flex items-center justify-center">
                <PartyPopper className="h-10 w-10 text-realty-gold" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to {purchasedPlanName}!
              </h2>
              <p className="text-muted-foreground mb-6">
                Thank you for upgrading. You now have access to all {purchasedPlanName} features.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowWelcome(false)
                    router.push('/')
                  }}
                  className="w-full bg-gradient-to-r from-realty-gold to-realty-gold-dark text-realty-navy font-semibold h-12"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowWelcome(false)}
                  className="w-full"
                >
                  Stay on Pricing
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PricingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-realty-gold" />
      </div>
    }>
      <PricingContent />
    </React.Suspense>
  )
}