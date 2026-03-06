"use client"

import Link from "next/link"
import Image from "next/image"
import { useProvider } from "@/context/provider-context"
import { useCart } from "@/context/cart-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, ShieldCheck, ShoppingCart, ArrowRight } from "lucide-react"
import FavoriteButton from "@/components/shared/favorite-button"
import { ServiceCardSkeleton } from "@/components/marketplace/service-skeleton"

export function FeaturedSections() {
    const { getAllServices, isLoading } = useProvider()
    const { addToCart, eventPlan } = useCart()
    const allServices = getAllServices()

    // Mock "Featured" as the first 4 verified services or just the first 4
    const featuredServices = allServices
        .filter(s => s.verified)
        .slice(0, 4)

    // Fallback if no verified services
    const displayFeatured = featuredServices.length > 0 ? featuredServices : allServices.slice(0, 4)

    // Top Rated: Strictly only services that have actual ratings/reviews
    const topRatedServices = allServices
        .filter(s => (s.rating && s.rating > 0) || (s.reviews && s.reviews > 0))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4)

    const handleAddToCart = (e: React.MouseEvent, service: any) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart({
            id: service.id,
            title: service.title,
            price: service.price,
            description: service.location,
            image: service.image,
            category: service.category,
        })
    }

    const renderCard = (service: any) => (
        <Link
            href={`/marketplace/${service.id}`}
            key={service.id}
            className="group block h-full"
        >
            <Card className="ls-glass bg-black/40 border-white/5 hover:border-ls-cyan/30 h-full overflow-hidden hover:shadow-[0_8px_30px_rgba(0,201,255,0.15)] transition-all duration-300 flex flex-col group-hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#1A1F25]">
                    <Image
                        src={service.image || "/placeholder-service.jpg"}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-2 left-2 z-10">
                        <FavoriteButton serviceId={String(service.id)} />
                    </div>
                    {service.verified && (
                        <Badge className="absolute top-2 right-2 bg-ls-cyan/20 text-ls-cyan border border-ls-cyan/30 shadow-sm backdrop-blur-md">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                        </Badge>
                    )}
                </div>
                <CardHeader className="p-4 pb-2 relative z-10">
                    <div className="absolute -top-6 right-4 z-20">
                        <Avatar className="h-12 w-12 border-2 border-[#1A1F25] shadow-lg">
                            <AvatarImage src={service.providerAvatar} />
                            <AvatarFallback className="bg-ls-blue/20 text-white font-bold text-[12px] border border-white/10">
                                {service.businessName?.[0] || "?"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <CardTitle className="ls-title text-base font-bold line-clamp-1 group-hover:text-ls-cyan transition-colors text-white">
                                {service.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-white/10 text-white/80 border-white/5 hover:bg-white/20 text-[10px] px-2 py-0.5 h-auto font-medium transition-colors">
                                    {service.category}
                                </Badge>
                                <span className="text-xs text-white/60 flex items-center line-clamp-1 font-inter">
                                    <MapPin className="w-3 h-3 mr-1 shrink-0 text-white/40" /> {service.location}
                                </span>
                            </div>

                            {eventPlan?.requiresVenue && service.category === "Locales y Salones" && (
                                <div className="mt-3 text-left">
                                    {(() => {
                                        const capacity = service.capacity || 0;
                                        const guests = eventPlan.guests || 0;
                                        if (capacity === 0) {
                                            return <Badge variant="outline" className="text-[10px] text-white/40 border-white/10 bg-black/20">Capacidad no especificada</Badge>;
                                        }
                                        if (capacity >= guests) {
                                            return <Badge className="bg-ls-lemon/10 text-ls-lemon hover:bg-ls-lemon/20 text-[10px] border border-ls-lemon/20">Amplio ({capacity} pers.)</Badge>;
                                        } else {
                                            return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">Espacio insuficiente ({capacity} pers.)</Badge>;
                                        }
                                    })()}
                                </div>
                            )}

                        </div>
                        <div className="flex items-center bg-ls-golden/10 px-2 py-1 rounded-md text-xs font-bold text-ls-golden border border-ls-golden/20 whitespace-nowrap">
                            <Star className="w-3.5 h-3.5 mr-1 fill-ls-golden" /> {service.rating?.toFixed(1) || "0.0"}
                        </div>
                    </div>
                </CardHeader>
                <CardFooter className="p-4 pt-4 mt-auto flex items-center justify-between border-t border-white/5 bg-black/20">
                    <div className="font-bold text-xl text-ls-lemon font-outfit">
                        ${service.price.toLocaleString()}
                        <span className="text-xs font-normal text-white/50 ml-1 font-inter">
                            {service.unit ? `/${service.unit}` : ""}
                        </span>
                    </div>
                    <Button size="sm" onClick={(e) => handleAddToCart(e, service)} className="ls-btn-cta rounded-lg shadow-[0_0_15px_rgba(0,201,255,0.2)] hover:shadow-[0_0_20px_rgba(0,201,255,0.4)] transition-all bg-gradient-to-r from-ls-blue to-ls-cyan text-white border-0 h-9 px-4">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Añadir
                    </Button>
                </CardFooter>
            </Card>
        </Link >
    )

    if (isLoading) {
        return (
            <section className="py-20 bg-ls-bg">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <div className="h-[350px] ls-glass animate-pulse rounded-xl bg-white/5" key={i} />)}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <div className="py-10 space-y-20 bg-ls-bg relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ls-blue/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Featured Section */}
            <section className="container relative z-10">
                <div className="flex justify-between items-end mb-8 relative">
                    <div className="relative">
                        <div className="absolute -left-4 top-1 w-1 h-8 bg-ls-cyan rounded-full shadow-[0_0_10px_rgba(0,201,255,0.8)]" />
                        <h2 className="ls-title text-3xl font-bold tracking-tight text-white">Servicios Destacados</h2>
                        <p className="text-white/60 mt-2 font-inter">Descubre los proveedores más populares y verificados.</p>
                    </div>
                    <Link href="/marketplace" className="hidden sm:flex items-center text-ls-cyan font-semibold hover:text-white transition-colors">
                        Ver todos <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayFeatured.length > 0 ? (
                        displayFeatured.map(renderCard)
                    ) : (
                        <div className="col-span-full py-12 text-center ls-glass border border-white/5 bg-black/20 rounded-xl">
                            <p className="text-white/50">Aún no hay servicios en esta categoría.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link href="/marketplace">
                        <Button variant="outline" className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 transition-colors">
                            Ver todos los servicios
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Top Rated Section */}
            <section className="container relative z-10">
                <div className="flex justify-between items-end mb-8 relative">
                    <div className="relative">
                        <div className="absolute -left-4 top-1 w-1 h-8 bg-ls-lemon rounded-full shadow-[0_0_10px_rgba(152,255,0,0.8)]" />
                        <h2 className="ls-title text-3xl font-bold tracking-tight text-white">Mejores Puntuados</h2>
                        <p className="text-white/60 mt-2 font-inter">Los servicios con las mejores calificaciones de nuestros clientes.</p>
                    </div>
                    <Link href="/marketplace?sort=rating" className="hidden sm:flex items-center text-ls-lemon font-semibold hover:text-white transition-colors">
                        Ver catálogo completo <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {topRatedServices.length > 0 ? (
                        topRatedServices.map(renderCard)
                    ) : (
                        <div className="col-span-full py-12 text-center ls-glass border border-white/5 bg-black/20 rounded-xl">
                            <p className="text-white/50">Aún no hay servicios puntuados.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
