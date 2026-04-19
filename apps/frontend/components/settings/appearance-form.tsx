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
import { Moon, Sun } from "lucide-react"

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
                    <div className="grid max-w-md grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className={`h-24 flex-col gap-2 ${theme === "light" ? "border-primary border-2" : ""}`}
                            onClick={() => setTheme("light")}
                        >
                            <Sun className="h-6 w-6" />
                            <span>Light</span>
                        </Button>
                        <Button
                            variant="outline"
                            className={`h-24 flex-col gap-2 ${theme === "dark" ? "border-primary border-2" : ""}`}
                            onClick={() => setTheme("dark")}
                        >
                            <Moon className="h-6 w-6" />
                            <span>Dark</span>
                        </Button>
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">
                        Select your preferred theme for the dashboard.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
