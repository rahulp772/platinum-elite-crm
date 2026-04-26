import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themes } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "sonner";
import { NotificationProvider } from "@/lib/notification-context";
import { SocketProvider } from "@/lib/socket-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Real Estate CRM",
    description: "Premium real estate customer relationship management system",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <QueryProvider>
                    <AuthProvider>
                        <NotificationProvider>
                            <SocketProvider>
                                <ThemeProvider
                                    attribute="class"
                                    defaultTheme="dark"
                                    themes={themes}
                                    enableSystem={false}
                                    disableTransitionOnChange
                                >
                                    {children}
                                </ThemeProvider>
                            </SocketProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
