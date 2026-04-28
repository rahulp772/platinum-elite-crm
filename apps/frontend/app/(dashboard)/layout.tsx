"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Loader2 } from "lucide-react"
import { Toaster } from "sonner"
import { useIsMobile } from "@/lib/hooks/use-media-query"
import { Sheet, SheetContent, SheetPortal, SheetOverlay, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const isMobile = useIsMobile()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    React.useEffect(() => {
        if (isMobile === false) {
            setMobileMenuOpen(false)
        }
    }, [isMobile])

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
        <TooltipProvider>
            <>
                <div className="flex h-screen overflow-hidden bg-background">
                {/* Background Effects - Only render on desktop for performance */}
                {!isMobile && (
                    <>
                        <div className="fixed inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-600/5 blur-[150px] animate-float" />
                            <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-blue-900/10 blur-[120px] animate-float-delayed" />
                            <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-amber-700/5 blur-[100px] animate-float" />
                            <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-slate-950/20 blur-[200px]" />
                        </div>
                        {/* Sidebar - Desktop always visible */}
                        <div className="hidden md:block">
                            <TooltipProvider>
                                <Sidebar 
                                    isMobile={false}
                                    mobileOpen={false}
                                    onMobileClose={() => {}}
                                />
                            </TooltipProvider>
                        </div>
                    </>
                )}

                {/* Mobile Sheet Drawer */}
                {isMobile && (
                    <Sheet open={mobileMenuOpen} onOpenChange={(open) => setMobileMenuOpen(open)}>
                        <SheetPortal>
                            <SheetOverlay className="bg-black/60" />
                            <SheetContent side="left" className="w-72 p-0 border-r">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetDescription className="sr-only">Main navigation menu for the application</SheetDescription>
                                <Sidebar 
                                    isMobile={true}
                                    mobileOpen={true}
                                    onMobileClose={() => setMobileMenuOpen(false)}
                                />
                            </SheetContent>
                        </SheetPortal>
                    </Sheet>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden relative z-10">
                    <Header 
                        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
                    />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
            <Toaster position="top-right" richColors closeButton expand={false} />
        </>
        </TooltipProvider>
    )
}
