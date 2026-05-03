"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function useAppRedirect() {
  const pathname = usePathname()

  useEffect(() => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) return

    const currentOrigin = window.location.origin
    const appOrigin = new URL(appUrl).origin

    if (currentOrigin !== appOrigin) {
      const redirectUrl = `${appOrigin}${pathname}${window.location.search}`
      window.location.href = redirectUrl
    }
  }, [pathname])
}

export function getAppUrl(path: string = ""): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return path
  return `${appUrl}${path}`
}