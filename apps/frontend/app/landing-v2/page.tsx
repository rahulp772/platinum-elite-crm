"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAppUrl } from "@/lib/app-redirect"
import {
  Building2,
  Users,
  TrendingUp,
  CalendarCheck,
  BarChart3,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Star,
  Play,
  Shield,
  Zap,
  Globe,
  Award,
  Sparkles,
  Sun,
  Moon,
  Check,
  X,
  Target,
} from "lucide-react"

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6D1D] shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-110">
            <Building2 className="h-6 w-6 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            MakeIt<span className="text-[#D4AF37]">CRM</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground hover:text-[#D4AF37] transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href={getAppUrl("/login")} className="hidden sm:block">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              Sign In
            </Button>
          </Link>
          <Link href={getAppUrl("/register")}>
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962F] hover:from-[#F1D279] hover:to-[#D4AF37] text-slate-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              Start 7-Day Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}

const FloatingCard = ({ icon: Icon, title, value, color, className }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className={`absolute z-20 p-4 rounded-2xl bg-card/40 backdrop-blur-xl border border-border shadow-2xl ${className}`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{title}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  </motion.div>
)

const HeroSection = () => {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          
          <h1 className="text-5xl md:text-[64px] font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
            Stop Losing Leads.<br />
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F1D279] to-[#D4AF37] bg-clip-text text-transparent">
              Start Closing Deals.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed font-medium">
            Track every conversation, know when to follow up, and see what your team's working on. All from one screen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href={getAppUrl("/register")}>
                <Button size="lg" className="h-16 px-10 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 font-bold rounded-2xl group text-lg shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-transform">
                Start 7-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-10 border-border bg-accent/5 text-foreground rounded-2xl hover:bg-accent group text-lg border-2">
              <Play className="mr-2 h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
              See How It Works
            </Button>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-12">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
              No credit card needed
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
              Set up in 2 minutes
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
              Cancel anytime
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative lg:h-[700px] flex items-center justify-center"
        >
          {/* Decorative background for the mockup */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-blue-500/10 rounded-[40px] blur-[100px] scale-90 opacity-50" />
          
          {/* Main Infographic */}
          <div className="relative z-10 w-full max-w-[650px] aspect-[4/3] rounded-[40px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.6)] border border-[#D4AF37]/20 group bg-card/50 backdrop-blur-md p-2">
             <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent dark:from-black/40 z-10 pointer-events-none" />
             <div className="relative w-full h-full rounded-[32px] overflow-hidden border border-border/50">
               {mounted && (
                 <Image 
                    src={theme === "dark" ? "/images/hero-dark.png" : "/images/hero-light.png"} 
                    alt="CRM Infographic" 
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    priority
                 />
               )}
             </div>
          </div>

          {/* Floating Elements */}
          <FloatingCard 
            icon={TrendingUp} 
            title="Agency Revenue" 
            value="+42.8%" 
            color="emerald" 
            className="top-[5%] -left-8 animate-float shadow-emerald-500/10 border-emerald-500/20"
          />
          <FloatingCard 
            icon={Users} 
            title="Lead Conversion" 
            value="3.5x Faster" 
            color="blue" 
            className="bottom-[10%] -right-8 animate-float-delayed shadow-blue-500/10 border-blue-500/20"
          />
          <FloatingCard 
            icon={Shield} 
            title="Data Security" 
            value="Isolated" 
            color="amber" 
            className="-bottom-8 left-1/4 shadow-amber-500/10 border-amber-500/20"
          />
        </motion.div>
      </div>
    </section>
  )
}



const BenefitsSection = () => {
  const benefits = [
    {
      title: "Track Every Lead",
      desc: "Never miss a follow-up again. Know which leads are hot and which are going cold.",
      icon: Target,
      color: "blue"
    },
    {
      title: "Visual Pipeline",
      desc: "See every deal at every stage. No more guessing where things stand.",
      icon: TrendingUp,
      color: "amber"
    },
    {
      title: "Team Chat",
      desc: "Message your team without mixing in personal texts. Everything in one place.",
      icon: MessageSquare,
      color: "purple"
    },
    {
        title: "Role-Based Access",
        desc: "Agents see their own work. Managers see the team. Admins see everything.",
        icon: Shield,
        color: "emerald"
      },
      {
        title: "Reports Without the Headache",
        desc: "See your numbers without needing a spreadsheet degree. Simple as that.",
        icon: BarChart3,
        color: "rose"
      },
      {
        title: "Manage Multiple Offices",
        desc: "One dashboard for all your agents and properties. Growing teams love this.",
        icon: Globe,
        color: "sky"
      }
  ]

  return (
    <section id="features" className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">Why Brokers Choose MakeItCRM</Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Run your agency <br /> from one screen</h2>
          <p className="text-muted-foreground text-lg">No PhD required. No 3-hour training sessions. Just a CRM your team will actually use.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-3xl bg-card border border-border hover:border-[#D4AF37]/30 transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl bg-accent/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <benefit.icon className={`h-7 w-7 text-primary`} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{benefit.desc}</p>
              <Link href="#" className="flex items-center text-sm font-bold text-[#D4AF37] group-hover:gap-2 transition-all">
                Learn More <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FeatureSplit = () => {
    return (
        <section className="py-32 bg-background">
            <div className="container mx-auto px-6">
                {/* Feature 1 */}
                <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold mb-6">
                            <Zap className="h-3 w-3" />
                            Lead & Deal Management
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                            Everything you need to <br />
                            <span className="text-[#D4AF37]">close more deals</span>
                        </h2>
                        <div className="space-y-6">
                            {[
                                "Lead tracking - log every call, email, and meeting",
                                "Deal stages - drag and drop deals through your pipeline",
                                "Task reminders - get notified when to follow up",
                                "Property listings - all your listings in one place"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden border border-border shadow-xl">
                            <Image src="/images/dashboard-mockup-v2.png" alt="Feature split" width={800} height={600} className="w-full" />
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full" />
                    </motion.div>
                </div>

                {/* Feature 2 */}
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative order-2 lg:order-1"
                    >
                        <div className="relative z-10 rounded-3xl overflow-hidden border border-border shadow-xl">
                             <Image src="/images/dashboard-mockup-v2.png" alt="Feature split" width={800} height={600} className="w-full" />
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold mb-6">
                            <Shield className="h-3 w-3" />
                            Data Privacy
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                            Your data stays <br />
                            <span className="text-[#D4AF37]">private</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                            Your client data is your competitive advantage. MakeItCRM keeps each agency's 
                            data completely isolated. Your competitors can never see your leads, deals, or contacts.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Data Isolation", val: "Complete" },
                                { label: "Role Controls", val: "5 Levels" },
                                { label: "Competitors", val: "Blocked" },
                                { label: "Your Data", val: "Yours" }
                            ].map((stat, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-card border border-border group hover:border-[#D4AF37]/30 transition-colors">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">{stat.label}</p>
                                    <p className="text-xl font-bold text-foreground group-hover:text-[#D4AF37] transition-colors">{stat.val}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}





const Testimonials = () => {
    const reviews = [
        {
            name: "Marcus Webb",
            role: "Broker Owner, Webb Realty Group",
            location: "Austin, TX",
            text: "We were using Excel for everything. Lost leads constantly. Moved to MakeItCRM 3 months ago and already closed 12 deals that would have slipped through the cracks. Worth every penny.",
            stars: 5
        },
        {
            name: "Jennifer Liu",
            role: "Team Lead, Premier Properties",
            location: "Miami, FL",
            text: "My agents actually USE this. Unlike the last 3 CRMs we tried. Simple enough for my 60-year-old agent, powerful enough for my top producers.",
            stars: 5
        },
        {
            name: "David Chen",
            role: "Managing Broker, Harbor Realty",
            location: "San Diego, CA",
            text: "Finally a CRM that doesn't need a 3-hour training session. Onboarded 8 agents in one afternoon. The pipeline view alone has helped us spot struggling deals 2 weeks earlier.",
            stars: 5
        }
    ]

    return (
        <section className="py-32 bg-background border-t border-border">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">What Brokers Say</Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">Real teams. Real results.</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {reviews.map((review, i) => (
                        <Card key={i} className="p-8 bg-card border-border rounded-3xl hover:border-[#D4AF37]/30 transition-colors">
                            <div className="flex gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />)}
                            </div>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-6">"{review.text}"</p>
                            <div className="border-t border-border pt-4">
                                <p className="font-bold text-foreground">{review.name}</p>
                                <p className="text-sm text-muted-foreground">{review.role}</p>
                                <p className="text-xs text-muted-foreground mt-1">{review.location}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

const PricingSection = () => {
    const plans = [
        {
            name: "Team",
            price: "29",
            period: "/user/mo",
            desc: "For small teams who need to track leads and deals together.",
            features: ["Unlimited leads & deals", "Pipeline management", "Team chat", "Basic reports", "Up to 10 users", "Mobile app"],
            buttonText: "Start 7-Day Free Trial",
            buttonLink: "/register",
            isPopular: false
        },
        {
            name: "Business",
            price: "49",
            period: "/user/mo",
            desc: "For growing agencies that need more visibility and control.",
            features: ["Everything in Team", "Advanced analytics", "Role-based access", "Priority support", "Unlimited users", "Custom fields"],
            buttonText: "Start 7-Day Free Trial",
            buttonLink: "/register",
            isPopular: true
        }
    ]

    return (
        <section id="pricing" className="py-32 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">Simple Pricing</Badge>
                    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">What you see <br /><span className="text-[#D4AF37]">is what you pay</span></h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Pay per user. No per-lead charges. Cancel anytime. No hard feelings.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative p-10 rounded-[32px] border ${
                                plan.isPopular 
                                    ? "bg-slate-900 border-[#D4AF37] shadow-[0_20px_50px_rgba(212,175,55,0.15)]" 
                                    : "bg-card border-border"
                            }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.isPopular ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-5xl font-black ${plan.isPopular ? "text-[#D4AF37]" : "text-foreground"}`}>
                                        ${plan.price}
                                    </span>
                                    <span className="text-muted-foreground font-medium">{plan.period}</span>
                                </div>
                                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{plan.desc}</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${plan.isPopular ? "bg-[#D4AF37]/20" : "bg-accent"}`}>
                                            <Check className={`h-3 w-3 ${plan.isPopular ? "text-[#D4AF37]" : "text-primary"}`} />
                                        </div>
                                        <span className={`text-sm ${plan.isPopular ? "text-slate-300" : "text-muted-foreground"}`}>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href={plan.buttonLink}>
                                <Button 
                                    className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${
                                        plan.isPopular 
                                            ? "bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 hover:scale-[1.02] shadow-lg shadow-[#D4AF37]/20" 
                                            : "bg-accent hover:bg-accent/80 text-foreground"
                                    }`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const AboutSection = () => {
    return (
        <section id="about" className="py-32 bg-background border-t border-border">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">Why We Built This</Badge>
                        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
                            We couldn't find a CRM <br />
                            <span className="text-[#D4AF37]">real estate teams would use</span>
                        </h2>
                        <p className="text-xl text-[#D4AF37] font-medium mb-8">
                            "Finally, a CRM your agents won't hate". That's what we heard from brokers again and again.
                        </p>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Most CRMs are built for salespeople. We built one for real estate brokers who 
                            needed something their whole team would actually use, not a tool that looks 
                            impressive in a demo but gets abandoned after a month.
                        </p>
                        <div className="space-y-6 mb-10">
                            {[
                                { title: "Simple", text: "Your team can start using it in minutes, not weeks." },
                                { title: "Affordable", text: "No per-lead charges. Pay per user, that's it." },
                                { title: "Private", text: "Your competitor data never leaves your account." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-accent/5 border border-border group hover:border-[#D4AF37]/30 transition-colors">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent flex items-center justify-center border border-[#D4AF37]/10 group-hover:scale-110 transition-transform">
                                        <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                                        <p className="text-sm text-muted-foreground">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[40px] overflow-hidden border border-border shadow-2xl">
                            <Image 
                                src="/images/about-v2.png" 
                                alt="Luxury Real Estate Office" 
                                width={1200} 
                                height={1200} 
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-10 left-10 right-10 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10">
                                <p className="text-white/90 text-lg italic mb-4">"MakeItCRM hasn't just changed how we track leads; it's changed how we think about our entire business strategy."</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-10 bg-[#D4AF37]" />
                                    <p className="text-white font-bold uppercase tracking-widest text-xs">James Sterling, CEO of Sterling Realty</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

const FinalCTA = () => {
    return (
        <section className="py-32 bg-background">
            <div className="container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[40px] overflow-hidden bg-accent border border-border p-12 md:p-24 text-center shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 blur-[100px] rounded-full" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
                    </div>

                    <h2 className="text-4xl md:text-7xl font-bold text-foreground mb-8 relative z-10">
                        Try it free for <br /><span className="text-[#D4AF37]">7 days</span>
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-12 relative z-10 font-medium">
                        No credit card needed. Takes 2 minutes to set up. See for yourself if it works for your team.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                        <Link href={getAppUrl("/register")}>
                            <Button size="lg" className="h-16 px-12 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 font-bold rounded-2xl text-xl shadow-[0_20px_50px_rgba(212,175,55,0.4)] hover:scale-[1.05] transition-transform">
                                Start 7-Day Free Trial
                            </Button>
                        </Link>
                    </div>
                    <p className="mt-8 text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-50">
                        No credit card • 7-day free trial • Cancel anytime
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

const Footer = () => {
    return (
        <footer className="py-16 bg-background border-t border-border">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]">
                                <Building2 className="h-5 w-5 text-slate-950" />
                            </div>
                            <span className="text-lg font-bold text-foreground tracking-tight">MakeIt<span className="text-[#D4AF37]">CRM</span></span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Simple CRM for real estate teams. Track leads, manage deals, and close more.
                        </p>
                    </div>

                    {[
                        { title: "Product", links: ["Features", "Pricing", "Security"] },
                        { title: "Company", links: ["About", "Contact"] },
                        { title: "Legal", links: ["Privacy", "Terms"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="text-foreground font-bold mb-6 uppercase tracking-widest text-xs">{col.title}</h4>
                            <ul className="space-y-3">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-muted-foreground hover:text-[#D4AF37] transition-colors text-sm">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-muted-foreground text-xs">&copy; 2026 MakeItCRM. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default function LandingV2() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#D4AF37] selection:text-slate-950 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <FeatureSplit />
      <Testimonials />
      <PricingSection />
      <AboutSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
