import Link from "next/link"
import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, DollarSign, Star, PartyPopper, Utensils, Music, Camera, GlassWater, Cake, Castle, Armchair, Users } from "lucide-react"
import { HeroSection } from "@/components/home/hero-section"
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
                <Link href={`/marketplace?category=${encodeURIComponent(cat.label)}`} key={i} className="group">
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

function Button({ children, size, variant, className }: any) {
  // Simple wrapper so we don't need to import Button component but still use it in Server Component if it was "use client"
  // Actually our UI components are client components by default often due to Radix, so we just import them.
  // Re-importing from UI to be safe.
  return <Link href="/register" className={className}>{children}</Link>
}
