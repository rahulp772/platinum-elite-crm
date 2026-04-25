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
  Globe,
  Sparkles,
  Sun,
  Moon,
  Check,
  Home,
  Handshake,
  LayoutDashboard,
  Layers,
  Lock,
  UsersRound,
  Target,
  DollarSign,
} from "lucide-react"

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
        <Link href="/landing-v3" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8A6D1D] shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-110">
            <Building2 className="h-6 w-6 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Platinum<span className="text-[#D4AF37]">Elite</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Modules", "Security", "Pricing"].map((item) => (
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

const HeroSection = () => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const modules = [
    { icon: Users, label: "Leads", color: "text-blue-500" },
    { icon: Handshake, label: "Deals", color: "text-amber-500" },
    { icon: Home, label: "Properties", color: "text-emerald-500" },
    { icon: CalendarCheck, label: "Tasks", color: "text-purple-500" },
    { icon: BarChart3, label: "Analytics", color: "text-rose-500" },
    { icon: MessageSquare, label: "Messages", color: "text-cyan-500" },
  ]

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-background">
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
            Built for Modern Real Estate Teams
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6">
            Your All-in-One <br />
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F1D279] to-[#D4AF37] bg-clip-text text-transparent">
              Real Estate CRM
            </span> <br />
            for Growth
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
            Manage leads, deals, properties, and team collaboration — all from one platform. 
            Built with multi-tenant security and role-based access control for teams of any size.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 font-bold rounded-xl group">
                Try for Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 border-border bg-accent/5 text-foreground rounded-xl hover:bg-accent group">
                <Play className="mr-2 h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                View Demo
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {modules.slice(0, 5).map((m, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-accent flex items-center justify-center">
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">6 Integrated Modules</p>
              <p className="text-xs text-muted-foreground">Leads, Deals, Properties, Tasks, Analytics, Messages</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative lg:h-[550px] flex items-center justify-center"
        >
          <div className="relative z-10 w-full max-w-[600px] aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-border bg-card/50 backdrop-blur-sm p-4">
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="col-span-2 h-8 flex items-center gap-2 border-b border-border pb-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                <span className="text-xs text-muted-foreground ml-auto">Dashboard v2</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {modules.slice(0, 4).map((m, i) => (
                  <div key={i} className="bg-accent/30 rounded-lg p-2 flex flex-col items-center justify-center gap-1">
                    <m.icon className={`h-4 w-4 ${m.color}`} />
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-accent/30 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-2">
                  <BarChart3 className="h-3 w-3 text-rose-500" />
                  <span className="text-[10px] text-muted-foreground">Revenue</span>
                </div>
                <div className="h-10 bg-rose-500/20 rounded flex items-end gap-1 p-1">
                  <div className="bg-rose-500/50 w-2 h-3 rounded-sm" />
                  <div className="bg-rose-500/50 w-2 h-5 rounded-sm" />
                  <div className="bg-rose-500/50 w-2 h-4 rounded-sm" />
                  <div className="bg-rose-500/80 w-2 h-6 rounded-sm" />
                  <div className="bg-rose-500 w-2 h-8 rounded-sm" />
                </div>
              </div>
              <div className="col-span-2 bg-accent/30 rounded-lg p-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-3 w-3 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-foreground font-medium">Active Teams</div>
                  <div className="text-[8px] text-muted-foreground">Real-time collaboration</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const ModulesSection = () => {
  const modules = [
    {
      title: "Lead Management",
      description: "Capture, track, and nurture leads through the pipeline. Filter by source, status, and assigned agent.",
      icon: Users,
      color: "blue",
      tags: ["Pipeline View", "Lead Filters", "Mandatory Follow-up"]
    },
    {
      title: "Deal Pipeline",
      description: "Visualize deals through every stage with our Kanban-style board. Drag and drop to update deal stages.",
      icon: Handshake,
      color: "amber",
      tags: ["Kanban Board", "Drag & Drop", "Stage Tracking"]
    },
    {
      title: "Property Listings",
      description: "Manage your property portfolio with rich media, specs, features, and seamless listing management.",
      icon: Home,
      color: "emerald",
      tags: ["Media Gallery", "Property Specs", "Status Tracking"]
    },
    {
      title: "Tasks & Calendar",
      description: "Schedule client interactions, set reminders, and track due dates with the built-in calendar integration.",
      icon: CalendarCheck,
      color: "purple",
      tags: ["Scheduling", "Reminders", "Due Dates"]
    },
    {
      title: "Analytics",
      description: "Gain deep insights into performance with revenue charts, agent leaderboards, and source distribution analytics.",
      icon: BarChart3,
      color: "rose",
      tags: ["Revenue Charts", "Leaderboard", "Source Analysis"]
    },
    {
      title: "Team Messaging",
      description: "Keep your team aligned with internal messaging, conversation threads, and read receipts.",
      icon: MessageSquare,
      color: "cyan",
      tags: ["Internal Chat", "Threads", "Read Status"]
    },
  ]

  return (
    <section id="modules" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-20">
          <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">Core Modules</Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Everything you need to <br />manage your business</h2>
          <p className="text-muted-foreground text-lg">Six integrated modules designed specifically for real estate professionals — from lead capture to deal closure.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-8 rounded-3xl bg-card border border-border hover:border-[#D4AF37]/30 transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${module.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <module.icon className={`h-7 w-7 text-${module.color}-500`} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{module.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">{module.description}</p>
              <div className="flex flex-wrap gap-2">
                {module.tags.map((tag, j) => (
                  <span key={j} className="text-[10px] font-medium px-2 py-1 rounded-full bg-accent text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const DashboardV2Section = () => {
  const widgets = [
    { label: "Active Deals", value: "24", icon: Handshake },
    { label: "Hot Leads", value: "12", icon: Target },
    { label: "Pipeline Value", value: "$2.4M", icon: DollarSign },
    { label: "Team Performance", value: "98%", icon: UsersRound },
    { label: "Expiring Properties", value: "6", icon: Home },
    { label: "Today Tasks", value: "8", icon: CalendarCheck },
  ]

  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-6 border-blue-500/30 text-blue-500 bg-blue-500/10">New Feature</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Introducing <br />
              <span className="text-[#D4AF37]">Dashboard v2</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              A fully customizable dashboard with draggable widgets. Choose from 20+ widget types 
              to build your perfect view. Track what matters most to your business.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {widgets.map((widget, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-accent/30 border border-border">
                  <div className="p-2 rounded-lg bg-[#D4AF37]/10">
                    <widget.icon className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{widget.label}</p>
                    <p className="text-lg font-bold text-foreground">{widget.value}</p>
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
            <div className="relative z-10 rounded-2xl overflow-hidden border border-border shadow-2xl bg-card p-4">
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-xs text-muted-foreground ml-auto">My Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-20 rounded-xl bg-accent/50 border border-border flex items-center justify-center ${i === 1 ? 'col-span-2' : ''}`}>
                    <div className="h-2 w-16 bg-[#D4AF37]/20 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 blur-[60px] rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const SecuritySection = () => {
  const roles = [
    { level: 200, name: "Super Admin", description: "Full system access across all tenants" },
    { level: 100, name: "Admin", description: "Full access within tenant" },
    { level: 80, name: "Manager", description: "View team performance" },
    { level: 50, name: "Team Lead", description: "Manage agent tasks" },
    { level: 10, name: "Agent", description: "Access own data only" },
  ]

  return (
    <section id="security" className="py-32 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-6 border-emerald-500/30 text-emerald-500 bg-emerald-500/10">Enterprise Security</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              Multi-tenant <br />
              <span className="text-[#D4AF37]">Architecture</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Built for agencies and teams of any size. Each tenant gets isolated data with 
              complete role-based access control. Super admins can manage multiple organizations 
              from a single platform.
            </p>

            <div className="space-y-4">
              {roles.slice(0, 4).map((role, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{role.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">Level {role.level}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
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
            <div className="relative z-10 rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-card to-accent/30 p-8">
              <div className="flex items-center gap-3 mb-8">
                <Lock className="h-6 w-6 text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-foreground">Security Features</h3>
              </div>
              <div className="space-y-4">
                {[
                  "Tenant isolation with foreign key constraints",
                  "Role-based permissions (granular access)",
                  "Dynamic permissions loaded from roles",
                  "Task visibility based on role hierarchy",
                  "JWT-based authentication"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
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
      desc: "Perfect for individual agents.",
      features: ["Up to 500 Leads", "Basic Analytics", "Email Support", "Single User"],
      isPopular: false
    },
    {
      name: "Professional",
      price: "129",
      desc: "For growing teams and agencies.",
      features: ["Unlimited Leads", "Advanced Analytics", "Priority Support", "Up to 10 Users", "Team Collaboration"],
      isPopular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For large-scale firms.",
      features: ["White-label Branding", "24/7 Support", "API Access", "Unlimited Users", "Custom Integrations"],
      isPopular: false
    }
  ]

  return (
    <section id="pricing" className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 border-[#D4AF37]/30 text-[#D4AF37]">Pricing</Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Simple, transparent <br /><span className="text-[#D4AF37]">pricing</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">No hidden fees. Choose the plan that fits your business scale.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-[32px] border ${
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
              <h3 className={`text-2xl font-bold mb-2 ${plan.isPopular ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className={`text-5xl font-black ${plan.isPopular ? "text-[#D4AF37]" : "text-foreground"}`}>
                  {plan.price === "Custom" ? "" : "$"}
                  {plan.price}
                </span>
                {plan.price !== "Custom" && <span className="text-muted-foreground font-medium">/mo</span>}
              </div>
              <p className="text-muted-foreground text-sm mb-6">{plan.desc}</p>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Check className={`h-4 w-4 ${plan.isPopular ? "text-[#D4AF37]" : "text-primary"}`} />
                    <span className={`text-sm ${plan.isPopular ? "text-slate-300" : "text-muted-foreground"}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button 
                  className={`w-full h-12 rounded-xl font-semibold ${
                    plan.isPopular 
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 hover:scale-[1.02]" 
                      : "bg-accent hover:bg-accent/80 text-foreground"
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
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
          className="relative rounded-[40px] overflow-hidden bg-accent border border-border p-12 md:p-20 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 relative z-10">
            Ready to <span className="text-[#D4AF37]">grow</span> your business?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 relative z-10">
            Join real estate professionals who trust Platinum Elite to manage their leads, deals, and team collaboration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-slate-950 font-bold rounded-2xl text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/landing-v3" className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]">
                <Building2 className="h-5 w-5 text-slate-950" />
              </div>
              <span className="text-lg font-bold text-foreground">PlatinumElite</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The CRM built for real estate teams. Manage leads, deals, properties, and collaboration — all in one platform.
            </p>
          </div>

          {[
            { title: "Product", links: ["Leads", "Deals", "Properties", "Analytics"] },
            { title: "Company", links: ["About", "Contact", "Privacy", "Terms"] },
            { title: "Resources", links: ["Documentation", "API", "Support", "Status"] }
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-foreground font-bold mb-4 uppercase tracking-widest text-xs">{col.title}</h4>
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
          <p className="text-muted-foreground text-xs">&copy; 2026 Platinum Elite CRM. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Secure & Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function LandingV3() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#D4AF37] selection:text-slate-950 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ModulesSection />
      <DashboardV2Section />
      <SecuritySection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}