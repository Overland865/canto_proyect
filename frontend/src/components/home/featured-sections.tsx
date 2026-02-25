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
            <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-muted flex flex-col group-hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                        src={service.image || "/placeholder-service.jpg"}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 z-10">
                        <FavoriteButton serviceId={String(service.id)} />
                    </div>
                    {service.verified && (
                        <Badge className="absolute top-2 right-2 bg-white/90 text-primary hover:bg-white shadow-sm backdrop-blur-sm">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                        </Badge>
                    )}
                </div>
                <CardHeader className="p-4 pb-2 relative">
                    <div className="absolute -top-6 right-4 z-20">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                            <AvatarImage src={service.providerAvatar} />
                            <AvatarFallback className="bg-primary/5 text-[10px]">
                                {service.businessName?.[0] || "?"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                {service.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium">
                                    {service.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center line-clamp-1">
                                    <MapPin className="w-3 h-3 mr-1 shrink-0" /> {service.location}
                                </span>
                            </div>

                            {eventPlan?.requiresVenue && service.category === "Locales y Salones" && (
                                <div className="mt-2 text-left">
                                    {(() => {
                                        const capacity = service.capacity || 0;
                                        const guests = eventPlan.guests || 0;
                                        if (capacity === 0) {
                                            return <Badge variant="outline" className="text-[10px] text-muted-foreground bg-slate-50">Capacidad no especificada</Badge>;
                                        }
                                        if (capacity >= guests) {
                                            return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] border-emerald-200">Amplio ({capacity} pers.)</Badge>;
                                        } else {
                                            return <Badge variant="destructive" className="text-[10px] opacity-90">Espacio insuficiente ({capacity} pers.)</Badge>;
                                        }
                                    })()}
                                </div>
                            )}

                        </div>
                        <div className="flex items-center bg-primary/10 px-1.5 py-0.5 rounded text-xs font-bold text-primary whitespace-nowrap">
                            <Star className="w-3 h-3 mr-1 fill-primary" /> {service.rating?.toFixed(1) || "0.0"}
                        </div>
                    </div>
                </CardHeader>
                <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-dashed bg-slate-50/50 mt-2">
                    <div className="font-bold text-lg text-primary">
                        ${service.price.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                            {service.unit ? `/${service.unit}` : ""}
                        </span>
                    </div>
                    <Button size="sm" onClick={(e) => handleAddToCart(e, service)} className="rounded-full shadow-sm hover:shadow-md transition-all">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )

    if (isLoading) {
        return (
            <section className="py-20 bg-slate-50">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <div className="py-10 space-y-20">
            {/* Featured Section */}
            <section className="container">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Servicios Destacados</h2>
                        <p className="text-muted-foreground mt-2">Descubre los proveedores más populares y verificados.</p>
                    </div>
                    <Link href="/marketplace" className="hidden sm:flex items-center text-primary font-semibold hover:underline">
                        Ver todos <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayFeatured.length > 0 ? (
                        displayFeatured.map(renderCard)
                    ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground">Aún no hay servicios en esta categoría.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link href="/marketplace">
                        <Button variant="outline" className="w-full">
                            Ver todos los servicios
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Top Rated Section */}
            <section className="container">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Mejores Puntuados</h2>
                        <p className="text-muted-foreground mt-2">Los servicios con las mejores calificaciones de nuestros clientes.</p>
                    </div>
                    <Link href="/marketplace?sort=rating" className="hidden sm:flex items-center text-primary font-semibold hover:underline">
                        Ver catálogo completo <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {topRatedServices.length > 0 ? (
                        topRatedServices.map(renderCard)
                    ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground">Aún no hay servicios puntuados.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
