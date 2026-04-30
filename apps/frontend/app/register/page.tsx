"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RegisterPage() {
  const { register } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      await register({ name, email, password })
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-realty-gold/10 dark:bg-amber-600/10 blur-[150px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-realty-navy/10 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-realty-gold/5 dark:bg-amber-700/10 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-realty-gold to-realty-gold-dark mb-4 shadow-lg shadow-realty-gold/20">
            <Building2 className="h-8 w-8 text-realty-navy" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Join MakeItCRM</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create an account to start managing your properties
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-background border-input text-foreground focus-visible:ring-realty-gold/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" title="confirmPassword" className="text-foreground">Confirm</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="bg-background border-input text-foreground focus-visible:ring-realty-gold/50"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-realty-gold to-realty-gold-dark hover:from-realty-gold-light hover:to-realty-gold text-realty-navy font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-realty-gold hover:text-realty-gold-light font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}