import Link from "next/link"
import { Navbar } from "@/components/shared/navbar"
import { Button } from "@/components/ui/button"
import { Home, Calendar, CreditCard, Settings, User, Heart } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
                <div className="container flex h-16 items-center px-4">
                    <Link href="/" className="font-bold mr-8">Local_Space</Link>
                </div>
            </header>
            <div className="flex flex-1 container py-8 gap-8">
                <aside className="w-64 shrink-0 hidden md:block">
                    <nav className="flex flex-col gap-2">
                        <Link href="/dashboard/user/bookings">
                            <Button variant="ghost" className="w-full justify-start">
                                <Calendar className="mr-2 h-4 w-4" /> Historial
                            </Button>
                        </Link>
                        <Link href="/dashboard/user/payments">
                            <Button variant="ghost" className="w-full justify-start">
                                <CreditCard className="mr-2 h-4 w-4" /> Pagos
                            </Button>
                        </Link>
                        <Link href="/dashboard/user/favorites">
                            <Button variant="ghost" className="w-full justify-start">
                                <Heart className="mr-2 h-4 w-4" /> Mis Favoritos
                            </Button>
                        </Link>
                        <Link href="/dashboard/user/profile">
                            <Button variant="ghost" className="w-full justify-start">
                                <User className="mr-2 h-4 w-4" /> Perfil
                            </Button>
                        </Link>
                        <Link href="/dashboard/user/settings">
                            <Button variant="ghost" className="w-full justify-start">
                                <Settings className="mr-2 h-4 w-4" /> Configuración
                            </Button>
                        </Link>
                    </nav>
                </aside>
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
