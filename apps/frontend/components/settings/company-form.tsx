"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Building2 } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const companyFormSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    address: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

export function CompanyForm() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isFetching, setIsFetching] = React.useState(true)

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            name: "",
            address: "",
            phone: "",
            website: "",
        },
    })

    React.useEffect(() => {
        const fetchCompany = async () => {
            if (!user?.tenantId) return

            try {
                const res = await api.get(`/tenants/${user.tenantId}`)
                const tenant = res.data
                form.reset({
                    name: tenant.name || "",
                    address: tenant.address || "",
                    phone: tenant.phone || "",
                    website: tenant.website || "",
                })
            } catch (error) {
                console.error("Failed to fetch company data:", error)
            } finally {
                setIsFetching(false)
            }
        }

        fetchCompany()
    }, [user?.tenantId, form])

    const onSubmit = async (data: CompanyFormValues) => {
        if (!user?.tenantId) return

        setIsLoading(true)
        try {
            await api.patch(`/tenants/${user.tenantId}`, data)
            toast.success("Company details updated successfully")
        } catch (error) {
            console.error("Failed to update company:", error)
            toast.error("Failed to update company details")
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                </CardTitle>
                <CardDescription>
                    Manage your company details and contact information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input
                            id="name"
                            {...form.register("name")}
                            placeholder="My Real Estate Company"
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            {...form.register("address")}
                            placeholder="123 Main Street, City, Country"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                {...form.register("phone")}
                                placeholder="+1 234 567 8900"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                {...form.register("website")}
                                placeholder="https://example.com"
                            />
                            {form.formState.errors.website && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.website.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}