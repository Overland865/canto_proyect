"use client"

import { Navbar } from "@/components/shared/navbar"
import { useAuth } from "@/context/auth-context"

export default function ProviderDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // We can optionally block render if no user or wrong role, but usually page.tsx handles it or middleware.
    // The main change here is removing the sidebar and using the global Navbar.

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50">
            <Navbar />
            <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
