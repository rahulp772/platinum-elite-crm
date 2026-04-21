"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export const themes = ["light", "dark", "charcoal", "solarized", "gruvbox", "sage", "everforest", "blue-eclipse"]

export type Theme = string

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            themes={themes}
            enableSystem={false}
            disableTransitionOnChange={false}
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}
