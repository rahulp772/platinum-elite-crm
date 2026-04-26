"use client"

import { useAuth } from "@/lib/auth-context"

interface HasPermissionProps {
  required: string
  children: React.ReactNode
}

export function HasPermission({ required, children }: HasPermissionProps) {
  const { hasPermission, user } = useAuth()

  if (user?.isSuperAdmin) {
    return <>{children}</>
  }

  if (hasPermission(required)) {
    return <>{children}</>
  }

  return null
}