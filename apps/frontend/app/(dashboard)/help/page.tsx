"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Mail, MessageSquare, FileText, ExternalLink } from "lucide-react"

export default function HelpPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground mt-2">
                    Find answers to common questions or get in touch with our support team.
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Input placeholder="Search for help topics..." className="h-12 text-lg pl-4" />
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Read our detailed guides and tutorials</CardDescription>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">Live Chat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Chat with our support team in real-time</CardDescription>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-base">Email Support</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>Send us an email and we'll respond within 24h</CardDescription>
                    </CardContent>
                </Card>
            </div>

            {/* FAQ */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I add a new lead?</AccordionTrigger>
                            <AccordionContent>
                                Navigate to the Leads page and click the "Add Lead" button in the top right corner. Fill out the form with the lead's contact information and click "Save".
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How do I move a deal to a different stage?</AccordionTrigger>
                            <AccordionContent>
                                On the Deals page, simply drag and drop the deal card from one column to another. The stage will be updated automatically.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I customize my notification preferences?</AccordionTrigger>
                            <AccordionContent>
                                Yes! Go to Settings &gt; Notifications to configure which alerts you receive via email and push notifications.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How do I change my password?</AccordionTrigger>
                            <AccordionContent>
                                Visit Settings &gt; Account to update your password. For security reasons, you'll need to enter your current password first.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Contact */}
            <Card>
                <CardHeader>
                    <CardTitle>Still need help?</CardTitle>
                    <CardDescription>Our support team is here to assist you</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button>
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Support
                    </Button>
                    <Button variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Help Center
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
