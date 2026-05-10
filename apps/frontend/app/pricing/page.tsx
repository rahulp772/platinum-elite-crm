"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Check, PartyPopper, Users, Building, Zap, MessageCircle, Phone, TrendingUp } from "lucide-react"
import api from "@/lib/api"

interface Plan {
  id: string
  name: string
  displayName: string
  slug: string
  monthlyPrice: number
  yearlyPrice: number
  userLimit: number
  leadLimit: number
  features: string[]
  addOns: string[]
  recommended: boolean
  tagline: string
  description: string
  ctaText: string
  minPrice?: number
}

interface SubscriptionStatus {
  hasSubscription: boolean
  subscriptionId: string | null
  planName: string | null
  subscriptionStatus: string | null
  isOnHighestPlan: boolean
}

const FEATURE_LABELS: Record<string, string> = {
  leads_management: 'Lead Management',
  properties_management: 'Property Inventory',
  tasks_management: 'Task Management',
  basic_reminders: 'Basic Reminders',
  mobile_responsive: 'Mobile Responsive',
  basic_reports: 'Basic Reports',
  whatsapp_click_to_chat: 'WhatsApp Click-to-Chat',
  team_dashboard: 'Team Dashboard',
  auto_lead_assignment: 'Auto Lead Assignment',
  role_permissions: 'Role Permissions',
  facebook_integration: 'Facebook/Meta Integration',
  '99acres_sync': '99acres Integration',
  magicbricks_sync: 'MagicBricks Integration',
  whatsapp_automation: 'WhatsApp Automation',
  ai_calling: 'AI Calling Assistant',
  ai_lead_scoring: 'AI Lead Scoring',
  multi_branch: 'Multi-Branch Support',
  custom_branding: 'Custom Branding',
}

const ROI_EXAMPLE = "Close just 1 extra property deal and recover your yearly cost!"

function PricingContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = React.useState<Plan[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isYearly, setIsYearly] = React.useState(false)
  const [isPurchasing, setIsPurchasing] = React.useState<string | null>(null)
  const [showWelcome, setShowWelcome] = React.useState(false)
  const [purchasedPlanName, setPurchasedPlanName] = React.useState('')
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<SubscriptionStatus | null>(null)
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/plans')
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPlans(res.data.map((p: any) => ({ ...p })))
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchSubscriptionStatus = async () => {
      if (!user?.tenantId) return
      try {
        const res = await api.get('/auth/subscription')
        setSubscriptionStatus(res.data)
      } catch (error) {
        console.error('Failed to fetch subscription status:', error)
      }
    }

    fetchPlans()
    fetchSubscriptionStatus()
  }, [user?.tenantId])

  const handleSubscribe = async (planId: string) => {
    if (!user?.tenantId) {
      router.push('/login')
      return
    }

    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    // If user has subscription and it's not the Scale plan (custom pricing), try upgrade first
    if (subscriptionStatus?.hasSubscription && plan.monthlyPrice > 0) {
      setIsPurchasing(planId)
      try {
        await api.post('/subscriptions/upgrade', { planId })
        setPurchasedPlanName(plan.displayName || '')
        setShowWelcome(true)
      } catch (error: any) {
        // If upgrade fails (e.g., not allowed), try subscribe as fallback
        if (error?.response?.status === 400 && error?.response?.data?.message?.includes('upgrade')) {
          try {
            await api.post('/subscriptions/subscribe', { planId })
            setPurchasedPlanName(plan.displayName || '')
            setShowWelcome(true)
          } catch (subscribeError) {
            console.error('Subscribe error after upgrade failed:', subscribeError)
          }
        } else {
          console.error('Upgrade error:', error)
        }
      } finally {
        setIsPurchasing(null)
      }
      return
    }

    setIsPurchasing(planId)
    try {
      await api.post('/subscriptions/subscribe', { planId })
      setPurchasedPlanName(plan.displayName || '')
      setShowWelcome(true)
    } catch (error) {
      console.error('Subscribe error:', error)
    } finally {
      setIsPurchasing(null)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Custom'
    return `₹${price.toLocaleString('en-IN')}`
  }

  const getDisplayPrice = (plan: Plan) => {
    if (plan.monthlyPrice === 0) return 'Custom'
    if (isYearly) {
      return `₹${Math.round(plan.yearlyPrice / 12).toLocaleString('en-IN')}`
    }
    return `₹${plan.monthlyPrice.toLocaleString('en-IN')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-realty-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-realty-navy/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              Simple, <span className="text-[#D4AF37]">Affordable</span> Pricing
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              No hidden fees. No complicated plans. Just results for Indian brokers.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isYearly ? 'bg-realty-gold' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isYearly ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
            Save 2 months
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => {
            const price = getDisplayPrice(plan)
            const yearlyTotal = plan.yearlyPrice > 0 ? plan.yearlyPrice : 0
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border transition-all ${
                  plan.recommended
                    ? "bg-gradient-to-b from-slate-900 to-slate-950 border-[#D4AF37] shadow-[0_25px_60px_rgba(212,175,55,0.2)]"
                    : "bg-card border-border hover:border-realty-gold/30"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 text-xs font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-1 ${plan.recommended ? "text-white" : "text-foreground"}`}>
                    {plan.displayName}
                  </h3>
                  <p className={`text-sm ${plan.recommended ? "text-slate-400" : "text-muted-foreground"}`}>
                    {plan.tagline}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black ${plan.recommended ? "text-[#D4AF37]" : "text-foreground"}`}>
                      {price}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className={`text-sm ${plan.recommended ? "text-slate-400" : "text-muted-foreground"}`}>
                        /month
                      </span>
                    )}
                  </div>
                  {isYearly && yearlyTotal > 0 && (
                    <p className={`text-sm mt-1 ${plan.recommended ? "text-slate-400" : "text-muted-foreground"}`}>
                      ₹{yearlyTotal.toLocaleString('en-IN')}/year
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  <div className={`flex items-center gap-2 text-sm ${plan.recommended ? "text-slate-300" : "text-muted-foreground"}`}>
                    <Users className={`h-4 w-4 ${plan.recommended ? "text-[#D4AF37]" : "text-realty-gold"}`} />
                    <span>
                      {plan.userLimit === -1 ? 'Unlimited' : `Up to ${plan.userLimit}`} users
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${plan.recommended ? "text-slate-300" : "text-muted-foreground"}`}>
                    <Building className={`h-4 w-4 ${plan.recommended ? "text-[#D4AF37]" : "text-realty-gold"}`} />
                    <span>
                      {plan.leadLimit === -1 ? 'Unlimited' : `${plan.leadLimit.toLocaleString('en-IN')}`} leads
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${
                        plan.recommended ? "bg-[#D4AF37]/20" : "bg-realty-gold/10"
                      }`}>
                        <Check className={`h-3 w-3 ${plan.recommended ? "text-[#D4AF37]" : "text-realty-gold"}`} />
                      </div>
                      <span className={`text-sm ${plan.recommended ? "text-slate-300" : "text-muted-foreground"}`}>
                        {FEATURE_LABELS[feature] || feature}
                      </span>
                    </div>
                  ))}
                  {plan.features.length > 6 && (
                    <p className={`text-sm ${plan.recommended ? "text-slate-500" : "text-muted-foreground/60"}`}>
                      +{plan.features.length - 6} more features
                    </p>
                  )}
                </div>

                <Button 
                  className={`w-full h-12 rounded-xl font-semibold text-base transition-all ${
                    plan.recommended 
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 hover:scale-[1.02] shadow-lg shadow-[#D4AF37]/25" 
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isPurchasing === plan.id || (subscriptionStatus?.hasSubscription && plan.displayName.toLowerCase() === subscriptionStatus?.planName?.toLowerCase())}
                >
                  {isPurchasing === plan.id ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    (() => {
                      // Check if this specific plan is the current plan
                      const isCurrentPlan = subscriptionStatus?.hasSubscription && 
                        subscriptionStatus.planName && 
                        plan.displayName.toLowerCase() === subscriptionStatus.planName.toLowerCase()
                      
                      if (isCurrentPlan) {
                        return 'Current Plan'
                      }
                      if (subscriptionStatus?.hasSubscription) {
                        return 'Upgrade'
                      }
                      return plan.ctaText || 'Get Started'
                    })()
                  )}
                </Button>
              </motion.div>
            )
          })}
        </div>

        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-realty-gold/10 to-transparent border border-realty-gold/20">
            <TrendingUp className="h-8 w-8 text-realty-gold mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">ROI That Makes Sense</h3>
            <p className="text-muted-foreground">
              {ROI_EXAMPLE}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Everything Included</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <MessageCircle className="h-8 w-8 text-realty-gold mb-4" />
              <h4 className="font-semibold mb-2">WhatsApp Integrated</h4>
              <p className="text-sm text-muted-foreground">
                Click-to-chat and automation. Connect with clients on their favorite platform.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <Zap className="h-8 w-8 text-realty-gold mb-4" />
              <h4 className="font-semibold mb-2">No Lead Leakage</h4>
              <p className="text-sm text-muted-foreground">
                Auto-assign leads, track follow-ups, and never miss a hot opportunity.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <Phone className="h-8 w-8 text-realty-gold mb-4" />
              <h4 className="font-semibold mb-2">Works on Mobile</h4>
              <p className="text-sm text-muted-foreground">
                Easy for non-technical staff. Manage your CRM from anywhere.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-lg mb-2">Questions? Contact us at support@makeitcrm.com</p>
          <p className="text-sm">Free migration from Excel. Setup in 1 day.</p>
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
                Your subscription is now active. Start closing more deals!
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-realty-gold border-t-transparent" />
      </div>
    }>
      <PricingContent />
    </React.Suspense>
  )
}
