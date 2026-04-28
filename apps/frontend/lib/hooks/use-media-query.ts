"use client"

import * as React from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener)
    } else {
      mediaQuery.addListener(listener)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", listener)
      } else {
        mediaQuery.removeListener(listener)
      }
    }
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery("(max-width: 767px)")
export const useIsTablet = () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)")