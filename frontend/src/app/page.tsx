import Link from "next/link"
import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, DollarSign, Star, PartyPopper, Utensils, Music, Camera, GlassWater, Cake, Castle, Armchair, Users } from "lucide-react"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedSections } from "@/components/home/featured-sections"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LocalSpace | Tu plataforma para eventos sociales',
  description: 'Encuentra y reserva los mejores locales, banquetes, música y más para tu próximo evento.',
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        {/* Categories Section */}
        <section className="py-20 bg-ls-bg relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-full bg-ls-blue/5 blur-[120px] pointer-events-none" />

          <div className="container relative z-10">
            <h2 className="ls-title text-3xl font-bold tracking-tight mb-12 text-center">Todo lo que necesitas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[
                { icon: PartyPopper, label: "Locales y Salones", color: "text-ls-lemon", glow: "group-hover:shadow-[0_0_20px_rgba(152,255,0,0.3)]" },
                { icon: Utensils, label: "Banquetes", color: "text-ls-golden", glow: "group-hover:shadow-[0_0_20px_rgba(255,184,0,0.3)]" },
                { icon: Music, label: "Música y Shows", color: "text-ls-cyan", glow: "group-hover:shadow-[0_0_20px_rgba(0,201,255,0.3)]" },
                { icon: Camera, label: "Foto y Video", color: "text-[#B026FF]", glow: "group-hover:shadow-[0_0_20px_rgba(176,38,255,0.3)]" },
                { icon: Castle, label: "Inflables", color: "text-[#FF267A]", glow: "group-hover:shadow-[0_0_20px_rgba(255,38,122,0.3)]" },
                { icon: GlassWater, label: "Barra Libre", color: "text-ls-blue", glow: "group-hover:shadow-[0_0_20px_rgba(0,82,212,0.3)]" },
                { icon: Cake, label: "Mesa de Dulces", color: "text-ls-lemon", glow: "group-hover:shadow-[0_0_20px_rgba(152,255,0,0.3)]" },
                { icon: Users, label: "Meseros", color: "text-ls-cyan", glow: "group-hover:shadow-[0_0_20px_rgba(0,201,255,0.3)]" },
                { icon: Armchair, label: "Mobiliario", color: "text-ls-golden", glow: "group-hover:shadow-[0_0_20px_rgba(255,184,0,0.3)]" },
                { icon: Star, label: "Decoraciones", color: "text-[#B026FF]", glow: "group-hover:shadow-[0_0_20px_rgba(176,38,255,0.3)]" },
              ].map((cat, i) => (
                <Link href={`/marketplace?category=${encodeURIComponent(cat.label)}`} key={i} className="group">
                  <div className={`ls-glass transition-all duration-300 cursor-pointer h-full border-white/5 hover:border-white/20 bg-black/40 ${cat.glow}`}>
                    <div className="flex flex-col items-center justify-center p-6 gap-4 h-full">
                      <div className={`p-4 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors ${cat.color}`}>
                        <cat.icon className="w-8 h-8" />
                      </div>
                      <span className="font-semibold text-center text-sm text-white/90 font-inter">{cat.label}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FeaturedSections />

        {/* Value Proposition */}
        <section className="py-20 bg-ls-surface border-y border-white/5">
          <div className="container grid md:grid-cols-3 gap-8 relative z-10">
            <div className="flex flex-col gap-4 p-6 ls-glass bg-black/20 border-white/5 hover:border-ls-cyan/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-ls-cyan/10 flex items-center justify-center text-ls-cyan">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-outfit text-white">Seguridad Garantizada</h3>
              <p className="text-white/60 font-inter text-sm leading-relaxed">Validamos la identidad y propiedad de cada proveedor para evitar fraudes.</p>
            </div>
            <div className="flex flex-col gap-4 p-6 ls-glass bg-black/20 border-white/5 hover:border-ls-lemon/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-ls-lemon/10 flex items-center justify-center text-ls-lemon">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-outfit text-white">Control de Presupuesto</h3>
              <p className="text-white/60 font-inter text-sm leading-relaxed">Cotiza múltiples servicios y gestiona tus gastos en un solo lugar.</p>
            </div>
            <div className="flex flex-col gap-4 p-6 ls-glass bg-black/20 border-white/5 hover:border-ls-golden/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-ls-golden/10 flex items-center justify-center text-ls-golden">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-outfit text-white">Calidad Verificada</h3>
              <p className="text-white/60 font-inter text-sm leading-relaxed">Reseñas reales y sistema de reputación para asegurar el mejor servicio.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-ls-bg relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-ls-blue/20 blur-[120px] pointer-events-none" />

          <div className="container text-center relative z-10">
            <div className="ls-glass border-ls-cyan/20 bg-[#1A1F25]/80 rounded-3xl p-12 md:p-20 relative overflow-hidden backdrop-blur-xl">
              <div className="relative z-20 max-w-2xl mx-auto space-y-8">
                <h2 className="ls-title text-4xl font-extrabold tracking-tight bg-gradient-to-r from-ls-cyan to-white bg-clip-text text-transparent">
                  ¿Eres proveedor de servicios?
                </h2>
                <p className="text-white/70 text-lg font-inter">
                  Únete a <span className="text-white font-semibold">Local_Space</span> y llega a miles de clientes que buscan servicios verificados y de calidad.
                </p>
                <div className="pt-4">
                  <Link href="/register">
                    <Button size="lg" className="ls-btn-cta text-base h-14 px-10 shadow-[0_0_30px_rgba(0,201,255,0.4)] hover:shadow-[0_0_40px_rgba(0,201,255,0.5)] transition-all">
                      Registrar mi Negocio
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Decorative blobs for CTA */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-ls-blue/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl z-0"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-ls-cyan/30 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl z-0"></div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
