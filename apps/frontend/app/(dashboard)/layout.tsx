"use client"

import * as React from "react"
import { useIsMobile } from "@/lib/hooks/use-media-query"
import { Sheet, SheetContent, SheetPortal, SheetOverlay, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar"
import { TrialBanner } from "@/components/trial-banner"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const isMobile = useIsMobile()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

    React.useEffect(() => {
        if (isMobile === false) {
            setMobileMenuOpen(false)
        }
    }, [isMobile])

    return (
        <AuthGuard>
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
                        <div className="flex flex-1 flex-col overflow-hidden relative z-10 pb-16 md:pb-0">
                            <Header 
                                onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
                            />
                            <TrialBanner />
                            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                                {children}
                            </main>
                        </div>
                    </div>
                    <Toaster position="top-right" richColors closeButton expand={false} />

                    {/* Mobile Bottom Bar */}
                    <MobileBottomBar onMenuClick={() => setMobileMenuOpen(true)} />
                </>
            </TooltipProvider>
        </AuthGuard>
    )
}