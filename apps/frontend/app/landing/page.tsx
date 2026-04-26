"use client"

import * as React from "react"
import Link from "next/link"
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
    Home,
    Handshake,
    DollarSign,
    UserPlus,
} from "lucide-react"

const features = [
    {
        icon: Users,
        title: "Lead Management",
        description: "Track and nurture leads from first contact to conversion with intelligent pipeline management.",
    },
    {
        icon: Handshake,
        title: "Deal Pipeline",
        description: "Visualize your deals through every stage with our Kanban-style board and close more transactions.",
    },
    {
        icon: Home,
        title: "Property Listings",
        description: "Manage your property portfolio with rich media, specs, and seamless listing management.",
    },
    {
        icon: CalendarCheck,
        title: "Task Management",
        description: "Stay on top of client interactions with smart task scheduling and automated reminders.",
    },
    {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Gain deep insights into your performance with real-time dashboards and revenue tracking.",
    },
    {
        icon: MessageSquare,
        title: "Team Collaboration",
        description: "Keep your team aligned with internal messaging, task assignments, and role-based access.",
    },
]

const stats = [
    { icon: Home, value: "2,500+", label: "Properties Managed" },
    { icon: Handshake, value: "$125M+", label: "Deal Volume" },
    { icon: TrendingUp, value: "847", label: "Deals Closed" },
    { icon: UserPlus, value: "1,200+", label: "Active Leads" },
]

const testimonials = [
    {
        name: "Sarah Mitchell",
        role: "Broker Owner, Skyline Realty",
        content: "Platinum Elite CRM transformed how we manage our team. We've increased close rates by 35% since implementing it.",
    },
    {
        name: "James Chen",
        role: "Team Lead, Coastal Properties",
        content: "The analytics dashboard gives us instant clarity on performance. It's been a game-changer for our quarterly reviews.",
    },
    {
        name: "Maria Rodriguez",
        role: "Agent, Luxury Estates Group",
        content: "Finally, a CRM that understands real estate. The deal pipeline visualization saves me hours every week.",
    },
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-realty-gold to-realty-gold-dark">
                            <Building2 className="h-5 w-5 text-slate-950" />
                        </div>
                        <span className="text-lg font-bold text-white">Platinum Elite</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-300 hover:text-white">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-gradient-to-r from-realty-gold to-realty-gold-dark hover:from-realty-gold-light hover:to-realty-gold text-slate-950 font-semibold">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-600/10 blur-[150px] animate-float" />
                    <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-blue-900/20 blur-[120px] animate-float-delayed" />
                    <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-amber-700/10 blur-[100px]" />
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <Badge variant="outline" className="mb-6 border-realty-gold/50 text-realty-gold bg-realty-gold/10 px-4 py-1">
                        Trusted by 500+ Real Estate Professionals
                    </Badge>
                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                        Your All-in-One
                        <br />
                        <span className="bg-gradient-to-r from-realty-gold via-yellow-400 to-realty-gold bg-clip-text text-transparent">
                            Real Estate CRM
                        </span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400 sm:text-xl">
                        Streamline lead management, close more deals, and grow your agency with the
                        most powerful real estate CRM built for modern professionals.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-realty-gold to-realty-gold-dark hover:from-realty-gold-light hover:to-realty-gold text-slate-950 font-semibold h-12 px-8"
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="h-8 w-8 rounded-full border-2 border-slate-600 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-slate-500" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <Badge variant="outline" className="mb-4 border-blue-500/50 text-blue-400 bg-blue-500/10">
                            Features
                        </Badge>
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            Everything You Need to Succeed
                        </h2>
                        <p className="mx-auto max-w-2xl text-slate-400">
                            Powerful tools designed specifically for real estate professionals to manage
                            their entire business from a single platform.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="group border-white/10 bg-card/60 backdrop-blur-xl p-6 hover:border-realty-gold/30 transition-all duration-300"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-realty-gold/20 to-realty-gold-dark/20 group-hover:from-realty-gold/30 group-hover:to-realty-gold-dark/30 transition-all">
                                    <feature.icon className="h-6 w-6 text-realty-gold" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                                <p className="text-sm text-slate-400">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-24">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-realty-gold/5 to-transparent" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="mb-16 text-center">
                        <Badge variant="outline" className="mb-4 border-realty-gold/50 text-realty-gold bg-realty-gold/10">
                            Results
                        </Badge>
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            Powering Real Estate Success
                        </h2>
                        <p className="mx-auto max-w-2xl text-slate-400">
                            Join thousands of real estate professionals who trust Platinum Elite
                            to grow their business every day.
                        </p>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-realty-gold/20 to-realty-gold-dark/20">
                                    <stat.icon className="h-8 w-8 text-realty-gold" />
                                </div>
                                <div className="mb-1 text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
                                <div className="text-sm text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="relative py-24">
                <div className="container mx-auto px-4">
                    <div className="mb-16 text-center">
                        <Badge variant="outline" className="mb-4 border-green-500/50 text-green-400 bg-green-500/10">
                            Testimonials
                        </Badge>
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                            Loved by Industry Leaders
                        </h2>
                        <p className="mx-auto max-w-2xl text-slate-400">
                            See what real estate professionals are saying about Platinum Elite CRM.
                        </p>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <Card
                                key={index}
                                className="border-white/10 bg-card/60 backdrop-blur-xl p-6"
                            >
                                <div className="mb-4 flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="h-4 w-4 fill-realty-gold text-realty-gold"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="mb-4 text-slate-300">&ldquo;{testimonial.content}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-realty-gold to-realty-gold-dark text-slate-950 font-semibold">
                                        {testimonial.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{testimonial.name}</div>
                                        <div className="text-sm text-slate-400">{testimonial.role}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-realty-gold/10 blur-[150px]" />
                    <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-900/20 blur-[150px]" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                        Ready to Elevate Your Business?
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-slate-400">
                        Join hundreds of real estate professionals who have already made the switch.
                        Start your free trial today — no credit card required.
                    </p>
                    <Link href="/register">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-realty-gold to-realty-gold-dark hover:from-realty-gold-light hover:to-realty-gold text-slate-950 font-semibold h-12 px-8"
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-realty-gold to-realty-gold-dark">
                                <Building2 className="h-5 w-5 text-slate-950" />
                            </div>
                            <span className="text-lg font-bold text-white">Platinum Elite CRM</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-400">
                            <Link href="/login" className="hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link href="/register" className="hover:text-white transition-colors">
                                Register
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span> SOC 2 Compliant</span>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} Platinum Elite CRM. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}