
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, ShieldCheck, ArrowRight } from "lucide-react"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Proveedores Verificados | LocalSpace',
    description: 'Conoce a las empresas y profesionales detrás de los mejores eventos. Calidad garantizada por LocalSpace.',
}

async function getProviders() {
    const supabase = await createClient()

    // 1. Fetch approved profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'provider')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error loading providers:", error)
        return []
    }

    // 2. Fetch business details
    const { data: details } = await supabase.from('provider_profiles').select('*')
    const detailsMap = new Map(details?.map((d: any) => [d.id, d]) || [])

    // 3. Merge data
    return profiles.map((p: any) => {
        const detail = detailsMap.get(p.id)

        // Manejo de imágenes: gallery > cover_image > avatar_url > default
        let providerImages = ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop"];
        if (p.gallery && p.gallery.length > 0) {
            providerImages = p.gallery;
        } else if (p.cover_image) {
            providerImages = [p.cover_image];
        } else if (p.avatar_url) {
            providerImages = [p.avatar_url];
        }

        return {
            id: p.id,
            name: detail?.business_name || p.full_name, // Prefer business name
            description: p.description || detail?.description || "Sin descripción disponible.",
            location: detail?.location || "Mérida, Yucatán", // Fallback location
            rating: detail?.rating || 5.0, // Default rating if new
            verified: p.is_verified || false,
            images: providerImages,
            categories: detail?.categories || ["Servicios"]
        }
    })
}

export default async function ProvidersPage() {
    const providers = await getProviders()

    return (
        <div className="min-h-screen bg-[#0F1216] text-white">
            <div className="container py-12 relative">
                <Link href="/" className="absolute top-8 left-4 md:left-8 z-20">
                    <Button variant="ghost" size="sm" className="gap-2 text-white bg-white/5 border border-white/10 hover:border-ls-cyan/50 hover:bg-white/10 hover:text-ls-cyan hover:shadow-[0_0_15px_rgba(0,250,255,0.2)] font-inter font-medium rounded-full px-4 transition-all duration-300 backdrop-blur-md">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Volver
                    </Button>
                </Link>
                <div className="flex flex-col gap-4 mb-12 text-center items-center pt-8 relative z-10">
                    <Badge variant="outline" className="w-fit bg-ls-cyan/5 text-ls-cyan border-ls-cyan/20 font-inter shadow-[0_0_10px_rgba(0,250,255,0.1)]">Nuestros Socios</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-outfit text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Proveedores Verificados</h1>
                    <p className="text-xl text-white/50 max-w-2xl font-inter">
                        Conoce a las empresas y profesionales detrás de los mejores eventos. Calidad garantizada por Local_Space.
                    </p>
                </div>

                {providers.length === 0 ? (
                    <div className="text-center py-20 text-white/50 font-inter">
                        <p>No hay proveedores activos en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 pt-4">
                        {providers.map((provider) => (
                            <Link href={`/providers/${provider.id}`} key={provider.id} className="group h-full block">
                                <Card className="ls-glass bg-gradient-to-b from-white/[0.03] to-transparent border-white/10 h-full flex flex-col overflow-hidden hover:shadow-[0_0_30px_rgba(0,250,255,0.15)] hover:border-ls-cyan/40 hover:-translate-y-1 transition-all duration-300 relative">
                                    {/* Subtle inner glow on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-ls-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative aspect-video overflow-hidden bg-black/80 border-b border-white/5">
                                        <img
                                            src={provider.images[0]}
                                            alt={provider.name}
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-110 group-hover:contrast-125"
                                        />
                                        {provider.verified && (
                                            <Badge className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-ls-cyan border border-ls-cyan/30 shadow-[0_0_15px_rgba(0,250,255,0.2)]">
                                                <ShieldCheck className="w-4 h-4 mr-1.5" /> Verificado
                                            </Badge>
                                        )}
                                    </div>
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex justify-between items-start mb-3">
                                            <CardTitle className="text-2xl font-outfit text-white group-hover:text-ls-cyan transition-colors drop-shadow-md">
                                                {provider.name}
                                            </CardTitle>
                                            <div className="flex items-center bg-ls-lemon/10 border border-ls-lemon/20 px-3 py-1.5 rounded-md text-xs font-bold text-ls-lemon shadow-[0_0_10px_rgba(152,255,0,0.1)] backdrop-blur-sm">
                                                <Star className="w-3.5 h-3.5 mr-1.5 fill-ls-lemon" /> {provider.rating}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {provider.categories.map((cat: string, i: number) => (
                                                <Badge key={i} variant="outline" className="text-xs font-medium font-inter bg-white/5 hover:bg-white/10 text-white/80 border-white/10 transition-colors">
                                                    {cat}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 px-6 pb-6 pt-4">
                                        <p className="text-white/60 line-clamp-3 text-sm font-inter leading-relaxed">
                                            {provider.description}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-0 flex items-center justify-between text-sm text-white/50 border-t border-white/5 bg-white/[0.02] p-5 font-inter mt-auto relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-ls-cyan/0 via-ls-cyan/10 to-ls-cyan/0 translate-x-[-100%] group-hover:animate-shimmer pointer-events-none" />
                                        <span className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1.5 text-white/40" /> {provider.location}
                                        </span>
                                        <div className="flex items-center group-hover:translate-x-1 transition-transform p-0 text-sm font-semibold text-ls-cyan drop-shadow-[0_0_8px_rgba(0,250,255,0.4)]">
                                            Ver Perfil <ArrowRight className="w-4 h-4 ml-1.5" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

