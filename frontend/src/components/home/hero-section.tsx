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



    const heroImage = "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" // Party/Event

    return (
        <section className="relative h-[600px] w-full overflow-hidden bg-slate-950 text-white">
            <div
                className="absolute inset-0 h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="absolute inset-0 bg-black/60 z-10" />

            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                <Badge className="mb-6 px-4 py-2 text-sm bg-ls-cyan/10 hover:bg-ls-cyan/20 text-ls-cyan border-ls-cyan/30 backdrop-blur-md" variant="outline">
                    La plataforma #1 para eventos sociales
                </Badge>
                <h1 className="ls-title text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-ls-blue via-ls-cyan to-white drop-shadow-lg">
                    Local_Space
                </h1>
                <p className="text-xl md:text-2xl text-white/80 max-w-2xl mb-10 font-light leading-relaxed font-inter">
                    Organiza tu evento perfecto <span className="text-ls-lemon font-semibold">sin estrés</span>.
                    <br className="hidden md:block" /> Encuentra todo lo que necesitas en un solo lugar.
                </p>

                <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-10 relative group">
                    <div className="relative flex items-center">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-ls-cyan transition-colors z-10" />
                        <Input
                            placeholder="Busca servicios, salones, shows..."
                            className="ls-input h-16 pl-14 pr-36 rounded-full border-white/10 bg-black/40 backdrop-blur-xl text-white text-base placeholder:text-white/40 placeholder:text-center focus:bg-black/60 focus:border-ls-cyan focus:ring-1 focus:ring-ls-cyan transition-all shadow-2xl w-full text-center"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-12 rounded-full px-8 font-bold shadow-[0_0_15px_rgba(0,201,255,0.3)] hover:shadow-[0_0_20px_rgba(0,201,255,0.5)] ls-btn-cta bg-gradient-to-r from-ls-blue to-ls-cyan border-0"
                        >
                            Buscar
                        </Button>
                    </div>
                </form>

                <div className="mt-12 flex gap-8 text-sm font-medium text-white/70 font-inter">
                    <span className="flex items-center gap-2 bg-black/40 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
                        <ShieldCheck className="w-5 h-5 text-ls-cyan" /> Proveedores Verificados
                    </span>
                    <span className="flex items-center gap-2 bg-black/40 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
                        <DollarSign className="w-5 h-5 text-ls-lemon" /> Transparencia Total
                    </span>
                </div>
            </div>
        </section >
    )
}
