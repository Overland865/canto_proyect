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

const CATEGORIES = [
    "Locales",
    "Banquetes",
    "Música",
    "Decoración",
    "Foto y Video",
    "Inflables",
    "Barra Libre",
    "Mesa de Dulces",
    "Meseros",
    "Mobiliario"
]

export function MarketplaceContent({ initialCategory, initialSearch }: { initialCategory?: string | null, initialSearch?: string | null }) {
    const { getAllServices } = useProvider()
    const services = getAllServices()
    const { addToCart } = useCart()

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory && CATEGORIES.includes(initialCategory) ? [initialCategory] : []
    )
    const [priceRange, setPriceRange] = useState([50000])
    const [searchValue, setSearchValue] = useState(initialSearch || "")
    const [location, setLocation] = useState("all")
    const [minRating, setMinRating] = useState(0)

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
        const matchesLocation = location === "all" ||
            service.location.toLowerCase().includes(location.toLowerCase())
        const matchesRating = (service.rating || 0) >= minRating

        return matchesCategory && matchesPrice && matchesSearch && matchesLocation && matchesRating
    })

    const handleAddToCart = (e: React.MouseEvent, service: any) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart({
            id: service.id,
            title: service.title,
            price: service.price,
            description: service.location,
        })
    }

    return (
        <div className="min-h-screen flex flex-col">
            <FilterBar
                categories={CATEGORIES}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                location={location}
                onLocationChange={setLocation}
                minRating={minRating}
                onRatingChange={setMinRating}
            />

            <div className="flex-1 bg-slate-50/50">
                <div className="container max-w-[1920px] py-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">
                            {filteredServices.length} {filteredServices.length === 1 ? "resultado encontrado" : "resultados encontrados"}
                        </h2>
                        <p className="text-muted-foreground">Encuentra los mejores proveedores para tu evento.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => (
                                <Link
                                    href={`/marketplace/${service.id}`}
                                    key={service.id}
                                    className="group block h-full"
                                >
                                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-muted flex flex-col group-hover:-translate-y-1">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
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
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed">
                                <div className="bg-muted/50 p-6 rounded-full mb-4">
                                    <MapPin className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold">No encontramos resultados</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mt-2">Prueba ajustando los filtros o buscando en otra ubicación.</p>
                                <Button variant="outline" className="mt-6" onClick={() => { setSelectedCategories([]); setPriceRange([50000]); setSearchValue("") }}>
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
