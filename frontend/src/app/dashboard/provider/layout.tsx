"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, CalendarDays, MessageSquare, Settings, LogOut, Store } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function ProviderDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const sidebarItems = [
        {
            title: "Resumen",
            href: "/dashboard/provider",
            icon: LayoutDashboard
        },
        {
            title: "Mis Servicios",
            href: "/dashboard/provider/services",
            icon: Package
        },
        {
            title: "Reservas",
            href: "/dashboard/provider/bookings",
            icon: CalendarDays
        },
        {
            title: "Mensajes",
            href: "/dashboard/provider/messages",
            icon: MessageSquare
        },
        {
            title: "Configuración",
            href: "/dashboard/provider/profile",
            icon: Settings
        }
    ]

    const { logout } = useAuth()

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white shadow-sm hidden md:block">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                        <Store className="h-5 w-5" />
                        <span>Local_Space</span>
                    </Link>
                </div>
                <div className="flex flex-col gap-4 py-6 px-4">
                    <div className="px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                        Panel de Control
                    </div>
                    <nav className="flex flex-col gap-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || (item.href !== "/dashboard/provider" && pathname.startsWith(item.href))
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-slate-600"}`}
                                    >
                                        <Icon className={`mr-3 h-4 w-4 ${isActive ? "text-primary" : "text-slate-500"}`} />
                                        {item.title}
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="mt-auto px-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={logout}
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Top Header - Mobile Only Branding or Breadcrumbs could go here */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm md:hidden">
                    <Link href="/dashboard/provider" className="font-bold">Local_Space Panel</Link>
                    {/* Trigger for mobile sidebar would go here */}
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
