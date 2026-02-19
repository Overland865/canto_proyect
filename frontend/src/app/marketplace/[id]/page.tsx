"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, ShieldCheck, Check, X } from "lucide-react"
import { ServiceBookingCard } from "@/components/marketplace/service-booking-card"
import { useProvider } from "@/context/provider-context"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import ReviewsList from "@/components/reviews/ReviewsList"

export default function ServiceDetailPage() {
    const params = useParams()
    const { getAllServices } = useProvider()
    const [service, setService] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const services = getAllServices()
        const found = services.find(s => s.id === params.id)
        setService(found)
        setLoading(false)
    }, [params.id, getAllServices])

    if (loading) return <div className="p-10 text-center">Cargando...</div>

    if (!service) {
        return <div className="p-10 text-center">Servicio no encontrado</div>
    }

    // Ensure gallery has at least the main image
    const gallery = service.gallery && service.gallery.length > 0
        ? service.gallery
        : [service.image]

    return (
        <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{service.category}</Badge>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                        {service.verified && (
                            <div className="flex items-center text-primary font-medium mb-3">
                                <ShieldCheck className="w-4 h-4 mr-1" />
                                <span>Proveedor Verificado</span>
                            </div>
                        )}
                        <div className="flex items-center text-muted-foreground gap-4 text-sm">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {service.location}</span>
                            <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" /> {service.rating || 0} ({service.reviews || 0} reseñas)</span>
                        </div>
                    </div>

                    {/* Gallery Placeholder */}
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted relative group">
                        <img src={service.image} className="object-cover w-full h-full" alt={service.title} />

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="absolute bottom-4 right-4 shadow-lg">Ver todas las fotos</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
                                <div className="relative w-full aspect-video bg-black/50 rounded-lg flex items-center justify-center">
                                    <Carousel className="w-full max-w-3xl">
                                        <CarouselContent>
                                            {gallery.map((img: string, index: number) => (
                                                <CarouselItem key={index}>
                                                    <div className="relative aspect-video flex items-center justify-center">
                                                        <img src={img} alt={`Gallery ${index}`} className="object-contain max-h-[80vh] w-full rounded-md" />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="left-4" />
                                        <CarouselNext className="right-4" />
                                    </Carousel>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Acerca del servicio</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {service.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {["Wifi", "Estacionamiento", "Accesible", "Aire Acondicionado"].map(feat => (
                                <div key={feat} className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-1 rounded-full"><Check className="w-3 h-3 text-primary" /></div>
                                    <span className="text-sm">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Reviews */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Reseñas</h3>
                        <ReviewsList serviceId={service.id} />
                    </div>
                </div>

                {/* Booking Sidebar */}
                <div className="lg:col-span-1">
                    <ServiceBookingCard
                        price={service.price}
                        unit={service.unit}
                        category={service.category}
                        serviceId={service.id}
                        providerId={service.providerId}
                        serviceName={service.title}
                        providerPhone={service.contactPhone}
                    />
                </div>
            </div>
        </div>
    )
}
