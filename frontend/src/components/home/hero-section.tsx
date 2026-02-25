"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ShieldCheck, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useEffect } from "react"

export function HeroSection() {
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = React.useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    useEffect(() => {
        if (isAuthenticated && user?.role === 'provider') {
            router.push("/dashboard/provider")
        }
    }, [isAuthenticated, user, router])

    const heroImage = "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" // Party/Event

    return (
        <section className="relative h-[600px] w-full overflow-hidden bg-slate-950 text-white">
            <div
                className="absolute inset-0 h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-black/60 z-10" />

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                <Badge className="mb-6 px-4 py-2 text-sm bg-primary/20 hover:bg-primary/20 text-white border-primary/50 backdrop-blur-sm" variant="outline">
                    La plataforma #1 para eventos sociales
                </Badge>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400 drop-shadow-sm">
                    Local_Space
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-10 font-light leading-relaxed">
                    Organiza tu evento perfecto <span className="text-primary font-semibold">sin estrés</span>.
                    <br className="hidden md:block" /> Encuentra todo lo que necesitas en un solo lugar.
                </p>

                <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-10 relative group">
                    <div className="relative flex items-center">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors z-10" />
                        <Input
                            placeholder="Busca servicios, salones, shows..."
                            className="h-16 pl-14 pr-36 rounded-full border-white/20 bg-white/10 backdrop-blur-md text-white text-base placeholder:text-gray-400 placeholder:text-center focus:bg-white/20 focus:border-primary transition-all shadow-2xl w-full text-center"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 rounded-full px-8 font-bold shadow-lg"
                        >
                            Buscar
                        </Button>
                    </div>
                </form>

                <div className="mt-12 flex gap-8 text-sm font-medium text-gray-300">
                    <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Proveedores Verificados
                    </span>
                    <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <DollarSign className="w-5 h-5 text-primary" /> Transparencia Total
                    </span>
                </div>
            </div>
        </section >
    )
}
