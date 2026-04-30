"use client"

import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after we've finished loading AND confirmed no user
    if (!isLoading && !user && pathname !== "/login") {
      router.push(`/login?redirect=${pathname}`)
    }
  }, [isLoading, user, pathname, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-realty-gold" />
      </div>
    )
  }

  // Don't render children if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return <>{children}</>
}