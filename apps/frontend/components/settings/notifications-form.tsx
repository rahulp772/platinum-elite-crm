"use client"

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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const notificationsFormSchema = z.object({
    emailDigest: z.boolean(),
    newLeads: z.boolean(),
    dealUpdates: z.boolean(),
    marketingEmails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

export function NotificationsForm() {
    const form = useForm<NotificationsFormValues>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues: {
            emailDigest: true,
            newLeads: true,
            dealUpdates: true,
            marketingEmails: false,
        },
    })

    function onSubmit(data: NotificationsFormValues) {
        console.log(data)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                    Configure how you receive alerts and updates.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Email Notifications</h3>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="email-digest" className="flex flex-col space-y-1">
                                <span>Daily Digest</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive a summary of your daily tasks and activities.</span>
                            </Label>
                            <Switch id="email-digest" defaultChecked={true} />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                                <span>Marketing Emails</span>
                                <span className="font-normal text-xs text-muted-foreground">Receive emails about new features and promotions.</span>
                            </Label>
                            <Switch id="marketing-emails" defaultChecked={false} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Push Notifications</h3>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="new-leads" className="flex flex-col space-y-1">
                                <span>New Leads</span>
                                <span className="font-normal text-xs text-muted-foreground">Get notified when a new lead is assigned to you.</span>
                            </Label>
                            <Switch id="new-leads" defaultChecked={true} />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="deal-updates" className="flex flex-col space-y-1">
                                <span>Deal Updates</span>
                                <span className="font-normal text-xs text-muted-foreground">Get notified when a deal stage changes.</span>
                            </Label>
                            <Switch id="deal-updates" defaultChecked={true} />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">Save Preferences</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
