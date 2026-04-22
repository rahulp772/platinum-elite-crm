"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Loader2 } from "lucide-react"
import { Toaster } from "sonner"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-realty-gold" />
            </div>
        )
    }

    if (!user) {
        return null // Will redirect via useEffect
    }

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Background Effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-600/5 blur-[150px] animate-float" />
                    <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-blue-900/10 blur-[120px] animate-float-delayed" />
                    <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-amber-700/5 blur-[100px] animate-float" />
                    <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-slate-950/20 blur-[200px]" />
                </div>

                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden relative z-10">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster position="top-right" richColors closeButton expand={false} />
        </>
    )
}
