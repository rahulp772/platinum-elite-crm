"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, AlertCircle, User, Phone, MessageCircle, MapPin, Briefcase } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (user.isOnboardingComplete) {
      router.push('/')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const companyName = formData.get("companyName") as string
    const phone = formData.get("phone") as string
    const whatsapp = formData.get("whatsapp") as string
    const officeAddress = formData.get("officeAddress") as string
    const jobTitle = formData.get("jobTitle") as string

    if (!name) {
      setError("Please enter your full name.")
      setIsLoading(false)
      return
    }

    try {
      await updateProfile({
        name,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        officeAddress: officeAddress || undefined,
        jobTitle: jobTitle || undefined,
        isOnboardingComplete: true,
      })
      router.push('/')
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.isOnboardingComplete) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-realty-gold/10 dark:bg-amber-600/10 blur-[150px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-realty-navy/10 dark:bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-realty-gold/5 dark:bg-amber-700/10 blur-[100px]" />
      </div>

      <Card className="w-full max-w-lg relative z-10 border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="p-3 rounded-xl bg-gradient-to-br from-realty-gold to-realty-gold-dark mb-4 shadow-lg shadow-realty-gold/20">
            <Building2 className="h-8 w-8 text-realty-navy" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Complete Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Tell us a bit about yourself so we can personalize your experience
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
              <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company / Team Name
              </Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="My Real Estate Company"
                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Title
              </Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="Agent, Manager, Broker..."
                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-foreground flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeAddress" className="text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Office Address
              </Label>
              <Input
                id="officeAddress"
                name="officeAddress"
                placeholder="123 Main Street, City, Country"
                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-realty-gold/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-realty-gold to-realty-gold-dark hover:from-realty-gold-light hover:to-realty-gold text-realty-navy font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You can update these details anytime in Settings
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}