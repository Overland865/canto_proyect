
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
        <div className="container py-12 relative">
            <Link href="/" className="absolute top-8 left-4 md:left-8">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Volver
                </Button>
            </Link>
            <div className="flex flex-col gap-4 mb-12 text-center items-center pt-8">
                <Badge variant="secondary" className="w-fit">Nuestros Socios</Badge>
                <h1 className="text-4xl font-bold tracking-tight">Proveedores Verificados</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Conoce a las empresas y profesionales detrás de los mejores eventos. Calidad garantizada por Local_Space.
                </p>
            </div>

            {providers.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No hay proveedores activos en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {providers.map((provider) => (
                        <Link href={`/providers/${provider.id}`} key={provider.id} className="group h-full">
                            <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all border-muted">
                                <div className="relative aspect-video overflow-hidden bg-muted">
                                    <img
                                        src={provider.images[0]}
                                        alt={provider.name}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {provider.verified && (
                                        <Badge className="absolute top-4 right-4 bg-white/90 text-primary hover:bg-white shadow-sm">
                                            <ShieldCheck className="w-4 h-4 mr-1" /> Verificado
                                        </Badge>
                                    )}
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                            {provider.name}
                                        </CardTitle>
                                        <div className="flex items-center bg-primary/10 px-2 py-1 rounded text-xs font-bold text-primary">
                                            <Star className="w-3 h-3 mr-1 fill-primary" /> {provider.rating}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {provider.categories.map((cat: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs font-normal">
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground line-clamp-3 text-sm">
                                        {provider.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0 flex items-center justify-between text-sm text-muted-foreground border-t bg-muted/20 p-4">
                                    <span className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" /> {provider.location}
                                    </span>
                                    <div className="flex items-center group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent text-sm font-medium text-primary">
                                        Ver Perfil <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

