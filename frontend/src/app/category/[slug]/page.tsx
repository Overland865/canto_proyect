"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, ShieldCheck, ShoppingCart, ArrowLeft } from "lucide-react"
import { useProvider } from "@/context/provider-context"
import { useCart } from "@/context/cart-context"

// Mapping from URL slug/label to Data Category
const CATEGORY_MAP: Record<string, string> = {
    "Locales y Salones": "Locales",
    "Banquetes": "Banquetes",
    "Música y Shows": "Música",
    "Decoración": "Decoración",
    "Foto y Video": "Foto y Video",
    "Inflables": "Inflables",
    "Barra Libre": "Barra Libre",
    "Mesa de Dulces": "Mesa de Dulces",
    "Meseros": "Meseros",
    "Mobiliario": "Mobiliario"
}

export default function CategoryPage() {
    const params = useParams()
    // Decode the slug from the URL (e.g. "Locales%20y%20Salones" -> "Locales y Salones")
    const slug = decodeURIComponent(params.slug as string)

    // Determine the data category to filter by
    const dataCategory = CATEGORY_MAP[slug] || slug

    // Use real data from context
    const { getAllServices } = useProvider()
    const services = getAllServices()

    const { addToCart } = useCart()

    // Case-insensitive filtering
    const filteredServices = services.filter((service) => {
        if (!service.category) return false
        return service.category.toLowerCase().includes(dataCategory.toLowerCase()) ||
            dataCategory.toLowerCase().includes(service.category.toLowerCase())
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
        <div className="container py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{slug}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <Link href={`/marketplace/${service.id}`} key={service.id} className="group h-full">
                            <Card className="h-full overflow-hidden hover:shadow-lg transition-all border-muted flex flex-col">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {service.verified && (
                                        <Badge className="absolute top-2 right-2 bg-white/90 text-primary hover:bg-white">
                                            <ShieldCheck className="w-3 h-3 mr-1" /> Verificado
                                        </Badge>
                                    )}
                                </div>
                                <CardHeader className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {service.category}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                                <MapPin className="w-3 h-3 mr-1" /> {service.location}
                                            </p>

                                        </div>
                                        <div className="flex items-center bg-primary/10 px-2 py-1 rounded text-xs font-bold text-primary">
                                            <Star className="w-3 h-3 mr-1 fill-primary" /> {service.rating}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between">
                                    <div className="font-bold text-lg">
                                        ${service.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{service.unit ? `/${service.unit}` : ""}</span>
                                    </div>
                                    <Button size="sm" onClick={(e) => handleAddToCart(e, service)}>
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Agregar
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground text-lg">No se encontraron servicios en esta categoría.</p>
                        <Link href="/">
                            <Button variant="link">
                                Ver todas las categorías
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
