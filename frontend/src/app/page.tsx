"use client"

import Link from "next/link"
import * as React from "react"
import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, DollarSign, Star, PartyPopper, Utensils, Music, Camera, GlassWater, Cake, Castle, Armchair, Users } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user?.role === 'provider') {
      router.push("/dashboard/provider")
    }
  }, [isAuthenticated, user, router])

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  const heroImages = [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530103862676-de3c9a59af57?q=80&w=2070&auto=format&fit=crop"
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] w-full overflow-hidden bg-slate-950 text-white">
          {/* DEBUG INFO CONSUMER */}
          <div className="absolute top-20 left-4 z-50 bg-black/80 p-4 rounded text-xs text-green-400 font-mono border border-green-500 max-w-sm pointer-events-none">
            <p>IS AUTH: {isAuthenticated ? "YES" : "NO"}</p>
            <p>User Role: {user ? user.role : "null"}</p>
            <p>User ID: {user ? user.id : "null"}</p>
            <p>Auth Error: {useAuth().authError || "None"}</p>
          </div>
          <Carousel
            plugins={[plugin.current]}
            className="w-full h-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="h-[600px] ml-0">
              {heroImages.map((img, index) => (
                <CarouselItem key={index} className="pl-0 h-full w-full">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-1000 ease-out"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60 z-10" />

          {/* Hero Content */}
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

            <div className="flex gap-4">
              <Link href="/marketplace">
                <Button size="lg" className="rounded-full px-8 h-12 text-lg font-semibold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Explorar Catálogo
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex gap-8 text-sm font-medium text-gray-300">
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-primary" /> Proveedores Verificados
              </span>
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <DollarSign className="w-5 h-5 text-primary" /> Transparencia Total
              </span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Todo lo que necesitas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[
                { icon: PartyPopper, label: "Locales y Salones", color: "text-pink-500" },
                { icon: Utensils, label: "Banquetes", color: "text-orange-500" },
                { icon: Music, label: "Música y Shows", color: "text-blue-500" },
                { icon: Camera, label: "Foto y Video", color: "text-purple-500" },
                { icon: Castle, label: "Inflables", color: "text-yellow-500" },
                { icon: GlassWater, label: "Barra Libre", color: "text-cyan-500" },
                { icon: Cake, label: "Mesa de Dulces", color: "text-rose-500" },
                { icon: Users, label: "Meseros", color: "text-emerald-500" },
                { icon: Armchair, label: "Mobiliario", color: "text-indigo-500" },
              ].map((cat, i) => (
                <Link href={`/category/${encodeURIComponent(cat.label)}`} key={i} className="group">
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-muted h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                      <div className={`p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors ${cat.color}`}>
                        <cat.icon className="w-8 h-8" />
                      </div>
                      <span className="font-semibold text-center text-sm">{cat.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y">
          <div className="container grid md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Seguridad Garantizada</h3>
              <p className="text-muted-foreground">Validamos la identidad y propiedad de cada proveedor para evitar fraudes.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Control de Presupuesto</h3>
              <p className="text-muted-foreground">Cotiza múltiples servicios y gestiona tus gastos en un solo lugar.</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Calidad Verificada</h3>
              <p className="text-muted-foreground">Reseñas reales y sistema de reputación para asegurar el mejor servicio.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container text-center">
            <div className="bg-primary text-primary-foreground rounded-2xl p-12 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold">¿Eres proveedor de servicios?</h2>
                <p className="text-primary-foreground/80 text-lg">
                  Únete a Local_Space y llega a miles de clientes que buscan servicios verificados y de calidad.
                </p>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="font-bold">
                    Registrar mi Negocio
                  </Button>
                </Link>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
