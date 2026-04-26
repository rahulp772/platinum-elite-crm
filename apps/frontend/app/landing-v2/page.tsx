"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
            Platinum<span className="text-[#D4AF37]">Elite</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Solutions", "Pricing", "About"].map((item) => (
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
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8962F] hover:from-[#F1D279] hover:to-[#D4AF37] text-slate-950 font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              Start Free Trial
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
          <Badge variant="outline" className="mb-6 py-1 px-4 border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/10 rounded-full">
            <Sparkles className="h-3 w-3 mr-2 animate-pulse" />
            The Future of Real Estate Management
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6">
            Your All-in-One <br />
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F1D279] to-[#D4AF37] bg-clip-text text-transparent">
              CRM Solution
            </span> <br />
            for Growth
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
            Unlock your business potential. Manage your pipeline, boost collaboration, 
            and drive revenue with a CRM that's as dynamic as your business.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 font-bold rounded-xl group">
                Try for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 border-border bg-accent/5 text-foreground rounded-xl hover:bg-accent group">
              <Play className="mr-2 h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-slate-800 overflow-hidden relative">
                  <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="User" fill className="object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Over 20K+ Users</p>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1 underline cursor-pointer">Read Reviews</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          {/* Main Infographic */}
          <div className="relative z-10 w-full max-w-[650px] aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-border group bg-card/50 backdrop-blur-sm">
             <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent dark:from-black/40 z-10" />
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

          {/* Floating Elements */}
          <FloatingCard 
            icon={TrendingUp} 
            title="Total Revenue" 
            value="$4,032,903" 
            color="emerald" 
            className="top-[10%] -left-4 animate-float"
          />
          <FloatingCard 
            icon={Users} 
            title="Active Leads" 
            value="1,248" 
            color="blue" 
            className="bottom-[15%] -right-4 animate-float-delayed"
          />
          <FloatingCard 
            icon={CheckCircle2} 
            title="Deals Closed" 
            value="84" 
            color="amber" 
            className="-bottom-6 left-1/4"
          />
        </motion.div>
      </div>
    </section>
  )
}

const LogoCloud = () => {
  const logos = ["Slack", "Xiaomi", "HubSpot", "Walmart", "Spotify", "Amazon", "Google"]
  return (
    <section className="py-20 bg-background border-y border-border overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-10">
        <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">Trusted by 20+ world leading companies</p>
      </div>
      <div className="flex items-center justify-around gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
        {logos.map((logo) => (
          <span key={logo} className="text-2xl font-bold text-foreground tracking-tighter">{logo}</span>
        ))}
      </div>
    </section>
  )
}

const BenefitsSection = () => {
  const benefits = [
    {
      title: "Lead Management",
      desc: "Capture and nurture leads automatically with smart AI scoring and routing.",
      icon: Users,
      color: "blue"
    },
    {
      title: "Deal Pipeline",
      desc: "Visualize your entire sales cycle with our interactive Kanban-style interface.",
      icon: TrendingUp,
      color: "amber"
    },
    {
      title: "Team Sync",
      desc: "Keep your entire team aligned with real-time chat and shared tasks.",
      icon: MessageSquare,
      color: "purple"
    },
    {
        title: "Auto-Scheduling",
        desc: "Never miss a follow-up with intelligent calendar sync and reminders.",
        icon: CalendarCheck,
        color: "emerald"
      },
      {
        title: "Elite Analytics",
        desc: "Deep-dive into performance metrics with custom reporting and dashboards.",
        icon: BarChart3,
        color: "rose"
      },
      {
        title: "Secure Access",
        desc: "Enterprise-grade security with multi-tenant isolation and role-based control.",
        icon: Shield,
        color: "sky"
      }
  ]

  return (
    <section id="features" className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">The Platinum Advantage</Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">The benefits of utilizing <br /> our elite service</h2>
          <p className="text-muted-foreground text-lg">We provide a comprehensive suite of tools designed to transform how you manage real estate deals and client relationships.</p>
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
                            Elite Productivity
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                            Close Deals Quicker With <br />
                            <span className="text-[#D4AF37]">Predictive CRM Tools</span>
                        </h2>
                        <div className="space-y-6">
                            {[
                                "AI-powered lead scoring and prioritization",
                                "Automated document generation and e-signing",
                                "Intelligent deal forecasting and probability",
                                "Smart notifications for critical deal milestones"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">{item}</p>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-12 h-12 px-8 bg-accent/5 border border-border hover:bg-accent text-foreground rounded-xl">
                            Explore Productivity Tools
                        </Button>
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
                            <Globe className="h-3 w-3" />
                            Global Collaboration
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                            Seamless Collaboration for <br />
                            <span className="text-[#D4AF37]">Global Teams</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                            Whether your team is across the hall or across the globe, Platinum Elite 
                            keeps everyone in sync with real-time updates, shared workrooms, and 
                            advanced multi-tenant security.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Uptime", val: "99.9%" },
                                { label: "Latency", val: "<50ms" },
                                { label: "Security", val: "SOC2" },
                                { label: "Users", val: "Unlimited" }
                            ].map((stat, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-card border border-border">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">{stat.label}</p>
                                    <p className="text-xl font-bold text-foreground">{stat.val}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

const StatsSection = () => {
    const stats = [
        { label: "Properties Managed", val: "125K+", icon: Building2 },
        { label: "Successful Deals", val: "48K+", icon: TrendingUp },
        { label: "Team Satisfaction", val: "98%", icon: Award },
        { label: "Fortune 500 Clients", val: "200+", icon: Globe }
    ]

    return (
        <section className="py-32 bg-background border-t border-border">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center mb-6 border border-[#D4AF37]/10">
                                <stat.icon className="h-8 w-8 text-[#D4AF37]" />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{stat.val}</h3>
                            <p className="text-muted-foreground font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const Testimonials = () => {
    const reviews = [
        {
            name: "Sarah Jenkins",
            role: "Principal, Apex Realty",
            text: "The most intuitive CRM I've ever used. The transition was seamless and our productivity has doubled.",
            img: "https://i.pravatar.cc/150?u=sarah"
        },
        {
            name: "Michael Chen",
            role: "Global Head, Urban Core",
            text: "Platinum Elite gives us the high-level visibility we need for our international property portfolio.",
            img: "https://i.pravatar.cc/150?u=mike"
        },
        {
            name: "Elena Rodriguez",
            role: "Luxury Property Consultant",
            text: "The gold standard of real estate tech. It's not just a CRM, it's an unfair advantage in a competitive market.",
            img: "https://i.pravatar.cc/150?u=elena"
        }
    ]

    return (
        <section id="solutions" className="py-32 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">Testimonials</Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">Loved by Industry Leaders</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <Card key={i} className="p-8 bg-card border-border rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <MessageSquare className="h-20 w-20 text-foreground" />
                            </div>
                            <div className="flex gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />)}
                            </div>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-8 italic">"{review.text}"</p>
                            <div className="flex items-center gap-4">
                                <Image src={review.img} width={48} height={48} className="rounded-full border-2 border-[#D4AF37]/30" alt={review.name} />
                                <div>
                                    <p className="font-bold text-foreground">{review.name}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{review.role}</p>
                                </div>
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
            name: "Starter",
            price: "49",
            desc: "Perfect for individual agents starting their journey.",
            features: ["Up to 500 Leads", "Basic Analytics", "Email Support", "Mobile App Access", "Single User"],
            buttonText: "Start Starter Trial",
            isPopular: false
        },
        {
            name: "Professional",
            price: "129",
            desc: "Designed for high-performing teams and agencies.",
            features: ["Unlimited Leads", "Advanced AI Scoring", "Priority Support", "Team Collaboration Tools", "Up to 10 Users", "Custom Workflows"],
            buttonText: "Go Professional",
            isPopular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "Custom solutions for large-scale real estate firms.",
            features: ["White-label Branding", "24/7 Dedicated Support", "API Access", "Custom Integrations", "Unlimited Users", "Advanced Security"],
            buttonText: "Contact Sales",
            isPopular: false
        }
    ]

    return (
        <section id="pricing" className="py-32 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">Pricing Plans</Badge>
                    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Transparent Pricing for <br /><span className="text-[#D4AF37]">Elite Performance</span></h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose the plan that fits your business scale. No hidden fees, just pure growth.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
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
                                        {plan.price === "Custom" ? "" : "$"}
                                        {plan.price}
                                    </span>
                                    {plan.price !== "Custom" && <span className="text-muted-foreground font-medium">/month</span>}
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

                            <Button 
                                className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${
                                    plan.isPopular 
                                        ? "bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 hover:scale-[1.02] shadow-lg shadow-[#D4AF37]/20" 
                                        : "bg-accent hover:bg-accent/80 text-foreground"
                                }`}
                            >
                                {plan.buttonText}
                            </Button>
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
                        <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">About Platinum Elite</Badge>
                        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-[1.1]">
                            Redefining Real Estate <br />
                            <span className="text-[#D4AF37]">Excellence</span> through Tech
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Founded in 2024, Platinum Elite CRM was born out of a simple observation: 
                            the real estate industry was moving faster than its tools. We set out to 
                            build a platform that wasn't just a database, but a strategic engine for growth.
                        </p>
                        <div className="space-y-6 mb-10">
                            {[
                                { title: "Our Mission", text: "To empower every real estate professional with elite-level technology." },
                                { title: "Our Vision", text: "To become the global standard for property management and lead conversion." },
                                { title: "Our Values", text: "Innovation, Integrity, and Uncompromising Performance." }
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
                                <p className="text-white/90 text-lg italic mb-4">"Platinum Elite hasn't just changed how we track leads; it's changed how we think about our entire business strategy."</p>
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
                        Ready to <span className="text-[#D4AF37]">Elevate</span> <br /> Your Business?
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12 relative z-10">
                        Join hundreds of elite real estate professionals who are already using 
                        Platinum Elite CRM to scale their agencies.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                        <Link href="/register">
                            <Button size="lg" className="h-16 px-10 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 font-bold rounded-2xl text-xl shadow-[0_20px_50px_rgba(212,175,55,0.3)]">
                                Start Your Free Trial
                            </Button>
                        </Link>
                        <Button size="lg" variant="ghost" className="text-foreground hover:bg-background/50 h-16 px-10 rounded-2xl text-lg group">
                            Talk to an Expert
                            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

const Footer = () => {
    return (
        <footer className="py-20 bg-background border-t border-border">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-8">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]">
                                <Building2 className="h-5 w-5 text-slate-950" />
                            </div>
                            <span className="text-lg font-bold text-foreground tracking-tight">PlatinumElite</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                            The world's most advanced CRM for real estate professionals. Built for growth, security, and elite performance.
                        </p>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 w-10 rounded-xl bg-accent border border-border flex items-center justify-center hover:border-[#D4AF37]/50 transition-colors cursor-pointer group">
                                    <div className="h-4 w-4 bg-muted-foreground group-hover:bg-[#D4AF37] transition-colors rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: "Product", links: ["Features", "Pipeline", "Analytics", "Security"] },
                        { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
                        { title: "Resources", links: ["Documentation", "Help Center", "Blog", "Community"] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="text-foreground font-bold mb-8 uppercase tracking-widest text-xs">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-muted-foreground hover:text-[#D4AF37] transition-colors text-sm">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-muted-foreground text-xs">&copy; 2026 Platinum Elite CRM. All rights reserved.</p>
                    <div className="flex gap-8 text-xs text-muted-foreground">
                        <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="#" className="hover:text-foreground">Terms of Service</Link>
                        <Link href="#" className="hover:text-foreground">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default function LandingV2() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#D4AF37] selection:text-slate-950 overflow-x-hidden">
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
      
      <Navbar />
      <HeroSection />
      <LogoCloud />
      <BenefitsSection />
      <FeatureSplit />
      <StatsSection />
      <Testimonials />
      <PricingSection />
      <AboutSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
