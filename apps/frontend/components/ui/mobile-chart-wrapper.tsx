"use client"

import * as React from "react"
import { useIsMobile } from "@/lib/hooks/use-media-query"

interface MobileChartWrapperProps {
    children: React.ReactNode
}

export function MobileChartWrapper({ children }: MobileChartWrapperProps) {
    const isMobile = useIsMobile()
    
    // Clone children and inject isAnimationActive={false} on mobile
    return React.Children.map(children, (child) => {
        if (React.isValidElement(child) && isMobile) {
            return React.cloneElement(child as React.ReactElement<any>, {
                isAnimationActive: false,
            })
        }
        return child
    })
}

// Hook for chart components to use
export function useChartAnimation() {
    const isMobile = useIsMobile()
    return !isMobile // true = animate on desktop, false = no animation on mobile
}