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

export default function LoginPage() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login({ email, password })
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-600/10 blur-[150px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-amber-700/10 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-slate-800/50 bg-slate-950/40 backdrop-blur-xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-realty-gold to-realty-gold-dark/80 mb-4 shadow-lg shadow-amber-900/20">
            <Building2 className="h-8 w-8 text-slate-950" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Platinum Elite CRM</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-950/20 border-red-900/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-realty-gold/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" title="password" className="text-slate-300">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-realty-gold hover:text-realty-gold-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-slate-900/50 border-slate-800 text-white focus-visible:ring-realty-gold/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-realty-gold to-realty-gold-dark hover:from-realty-gold-light hover:to-realty-gold text-slate-950 font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <div className="text-sm text-center text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-realty-gold hover:text-realty-gold-light font-medium transition-colors"
              >
                Create an account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
