"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, ShieldCheck, ShoppingCart } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useCart } from "@/context/cart-context"
import { useProvider } from "@/context/provider-context"
import { FilterBar } from "@/components/marketplace/filter-bar"
import FavoriteButton from "@/components/shared/favorite-button"
import Image from "next/image"
import { ServiceCardSkeleton } from "@/components/marketplace/service-skeleton"

const CATEGORIES = [
    "Locales y Salones",
    "Banquetes",
    "Música y Shows",
    "Foto y Video",
    "Inflables",
    "Barra Libre",
    "Mesa de Dulces",
    "Meseros",
    "Mobiliario",
    "Decoraciones"
]

export function MarketplaceContent({ initialCategory, initialSearch }: { initialCategory?: string | null, initialSearch?: string | null }) {
    const { getAllServices } = useProvider()
    const services = getAllServices()
    const { addToCart, eventPlan } = useCart()

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory && CATEGORIES.includes(initialCategory) ? [initialCategory] : []
    )
    const [priceRange, setPriceRange] = useState([50000])
    const [searchValue, setSearchValue] = useState(initialSearch || "")
    const [minRating, setMinRating] = useState(0)
    const [sortOption, setSortOption] = useState("recommended")

    const handleCategoryChange = (category: string) => {
        if (category === "clear_all") {
            setSelectedCategories([])
            return
        }
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        )
    }

    const filteredServices = services.filter((service) => {
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat =>
            service.category.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(service.category.toLowerCase())
        )
        const matchesPrice = service.price <= priceRange[0]
        const matchesSearch = service.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            service.location.toLowerCase().includes(searchValue.toLowerCase()) ||
            service.category.toLowerCase().includes(searchValue.toLowerCase())

        const matchesRating = (service.rating || 0) >= minRating
        const isActive = service.is_active !== false // By default true, or explicitly true. Filter if exactly false.

        return matchesCategory && matchesPrice && matchesSearch && matchesRating && isActive
    })

    const sortedServices = [...filteredServices].sort((a, b) => {
        switch (sortOption) {
            case "price_asc":
                return a.price - b.price
            case "price_desc":
                return b.price - a.price
            case "rating":
                return (b.rating || 0) - (a.rating || 0)
            case "recommended":
            default:
                return 0
        }
    })

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

    return (
        <div className="min-h-screen flex flex-col bg-ls-bg text-white font-inter">
            <FilterBar
                categories={CATEGORIES}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                searchValue={searchValue}
                onSearchChange={setSearchValue}

                minRating={minRating}
                onRatingChange={setMinRating}
                onSortChange={setSortOption}
            />

            <div className="flex-1">
                <div className="container max-w-[1920px] py-8">
                    <div className="mb-6">
                        <h2 className="text-3xl font-outfit font-bold text-white">
                            {sortedServices.length} {sortedServices.length === 1 ? "resultado encontrado" : "resultados encontrados"}
                        </h2>
                        <p className="text-white/70">Encuentra los mejores proveedores para tu evento.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {useProvider().isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <ServiceCardSkeleton key={i} />
                            ))
                        ) : sortedServices.length > 0 ? (
                            sortedServices.map((service) => (
                                <Link
                                    href={`/marketplace/${service.id}`}
                                    key={service.id}
                                    className="group block h-full"
                                >
                                    <Card className="h-full overflow-hidden hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 ls-glass bg-black/40 border-white/5 flex flex-col group-hover:-translate-y-1 group-hover:border-ls-cyan/30">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
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
                                                <Badge className="absolute top-2 right-2 bg-ls-blue/90 text-white hover:bg-ls-blue shadow-sm backdrop-blur-sm border-none">
                                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                                                </Badge>
                                            )}
                                        </div>
                                        <CardHeader className="p-4 pb-2 relative">
                                            <div className="absolute -top-6 right-4 z-20">
                                                <Avatar className="h-10 w-10 border-2 border-[#1A1F25] shadow-md">
                                                    <AvatarImage src={service.providerAvatar} />
                                                    <AvatarFallback className="bg-[#1A1F25] text-white/70 text-[10px]">
                                                        {service.businessName?.[0] || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex justify-between items-start gap-2 pt-2">
                                                <div>
                                                    <CardTitle className="text-lg font-outfit font-bold line-clamp-1 group-hover:text-ls-cyan transition-colors text-white">
                                                        {service.title}
                                                    </CardTitle>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium bg-white/10 text-white/90 hover:bg-white/20 border-white/5">
                                                            {service.category}
                                                        </Badge>
                                                        <span className="text-xs text-white/60 flex items-center line-clamp-1">
                                                            <MapPin className="w-3 h-3 mr-1 shrink-0 text-ls-cyan" /> {service.location}
                                                        </span>
                                                    </div>

                                                    {eventPlan?.requiresVenue && service.category === "Locales y Salones" && (
                                                        <div className="mt-2 text-left">
                                                            {(() => {
                                                                const capacity = service.capacity || 0;
                                                                const guests = eventPlan.guests || 0;
                                                                if (capacity === 0) {
                                                                    return <Badge variant="outline" className="text-[10px] text-white/60 border-white/10">Capacidad no especificada</Badge>;
                                                                }
                                                                if (capacity >= guests) {
                                                                    return <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] border-emerald-500/30">Amplio ({capacity} pers.)</Badge>;
                                                                } else {
                                                                    return <Badge variant="destructive" className="text-[10px] bg-red-500/20 text-red-300 border-red-500/30">Espacio insuficiente ({capacity} pers.)</Badge>;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center bg-ls-golden/10 px-1.5 py-0.5 rounded text-xs font-bold text-ls-golden whitespace-nowrap border border-ls-golden/20 shadow-[0_0_10px_rgba(255,215,0,0.1)]">
                                                    <Star className="w-3 h-3 mr-1 fill-ls-golden" /> {service.rating?.toFixed(1) || "0.0"}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="p-4 pt-4 mt-auto flex items-center justify-between border-t border-white/5 bg-black/20">
                                            <div className="font-bold text-2xl font-outfit text-ls-lemon">
                                                ${service.price.toLocaleString()}
                                                <span className="text-xs font-inter font-normal text-white/50 ml-1">
                                                    {service.unit ? `/${service.unit}` : ""}
                                                </span>
                                            </div>
                                            <Button size="sm" onClick={(e) => handleAddToCart(e, service)} className="ls-btn-cta rounded-full shadow-lg">
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Agregar
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center rounded-xl ls-glass bg-black/40 border-white/10">
                                <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10">
                                    <MapPin className="w-12 h-12 text-white/40" />
                                </div>
                                <h3 className="text-2xl font-outfit font-bold text-white">No encontramos resultados</h3>
                                <p className="text-white/60 max-w-sm mx-auto mt-3 font-inter">Prueba ajustando los filtros de precio, bajando la calificación requerida, o buscando otra palabra clave.</p>
                                <Button variant="outline" className="mt-8 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white" onClick={() => { setSelectedCategories([]); setPriceRange([50000]); setSearchValue("") }}>
                                    Limpiar todos los filtros
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
