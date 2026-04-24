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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectLabel,
    SelectGroup,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { COMMON_TIMEZONES, getUserTimezone } from "@/lib/date-utils"
import { toast } from "sonner"

const profileFormSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    officeAddress: z.string().optional(),
    timezone: z.string().min(1),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
    const { user, setUser } = useAuth()
    const [isLoading, setIsLoading] = React.useState(false)
    const [defaultTimezone, setDefaultTimezone] = React.useState<string>("")

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            whatsapp: "",
            officeAddress: "",
            timezone: "",
        },
    })

    React.useEffect(() => {
        const detectedTz = getUserTimezone(user)
        setDefaultTimezone(detectedTz)
        if (user) {
            form.reset({
                name: user.name || "",
                email: user.email || "",
                phone: (user as any).phone || "",
                whatsapp: (user as any).whatsapp || "",
                officeAddress: (user as any).officeAddress || "",
                timezone: user.timezone || detectedTz,
            })
        }
    }, [user, form])

    async function onSubmit(data: ProfileFormValues) {
        setIsLoading(true)
        try {
            const response = await api.patch(`/users/${user?.id}`, {
                name: data.name,
                email: data.email,
                phone: data.phone,
                whatsapp: data.whatsapp,
                officeAddress: data.officeAddress,
                timezone: data.timezone,
            })

            const updatedUser = response.data

            if (setUser && updatedUser) {
                const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
                const newUser = { ...currentUser, ...updatedUser }
                localStorage.setItem("user", JSON.stringify(newUser))
                setUser(newUser)
            }

            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    Manage your public profile information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user?.avatar || ""} />
                            <AvatarFallback>
                                {form.watch("name")?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                {...form.register("name")}
                                defaultValue={form.getValues("name")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register("email")}
                                defaultValue={form.getValues("email")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+91 98765 43210"
                                {...form.register("phone")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input
                                id="whatsapp"
                                type="tel"
                                placeholder="+91 98765 43210"
                                {...form.register("whatsapp")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="officeAddress">Office Address</Label>
                            <Input
                                id="officeAddress"
                                {...form.register("officeAddress")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                defaultValue={form.getValues("timezone") || defaultTimezone}
                                onValueChange={(value) => form.setValue("timezone", value)}
                            >
                                <SelectTrigger id="timezone">
                                    <SelectValue placeholder="Select your timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMON_TIMEZONES.map((group) => (
                                        <SelectGroup key={group.label}>
                                            <SelectLabel>{group.label}</SelectLabel>
                                            {group.zones.map((tz) => (
                                                <SelectItem key={tz.value} value={tz.value}>
                                                    {tz.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[0.8rem] text-muted-foreground">
                                All dates and times will be displayed in this timezone.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}