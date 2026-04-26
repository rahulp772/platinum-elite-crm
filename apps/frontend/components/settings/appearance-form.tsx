"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const themeConfig = [
    { value: "light", label: "Light", description: "Clean light theme" },
    { value: "dark", label: "Dark", description: "Default dark theme" },
    { value: "charcoal", label: "Charcoal", description: "Eye-safe dark (#121212)" },
    { value: "solarized", label: "Solarized", description: "Blue-green balanced" },
    { value: "gruvbox", label: "Gruvbox", description: "Warm retro tones" },
    { value: "sage", label: "Sage", description: "Nature charcoal" },
    { value: "everforest", label: "Everforest", description: "Soft nature dark" },
    { value: "blue-eclipse", label: "Blue Eclipse", description: "Cool blue tones" },
]

export function AppearanceForm() {
    const { setTheme, theme } = useTheme()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                    Customize the look and feel of the application.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {themeConfig.map((t) => (
                            <Button
                                key={t.value}
                                variant="outline"
                                className={`h-auto py-4 flex-col gap-1.5 px-2 ${
                                    theme === t.value ? "border-primary border-2" : ""
                                }`}
                                onClick={() => setTheme(t.value)}
                            >
                                <span className="font-semibold text-sm">{t.label}</span>
                                <span className="text-[0.65rem] text-muted-foreground leading-tight">
                                    {t.description}
                                </span>
                            </Button>
                        ))}
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Select your preferred theme for the dashboard.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
