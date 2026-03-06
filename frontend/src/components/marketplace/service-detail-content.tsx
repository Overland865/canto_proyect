"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, ShieldCheck, Check, Users, Info } from "lucide-react"
import { ServiceBookingCard } from "@/components/marketplace/service-booking-card"
import { useProvider } from "@/context/provider-context"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import ReviewsList from "@/components/reviews/ReviewsList"
import FavoriteButton from "@/components/shared/favorite-button"
import { ComplementaryProviders } from "@/components/marketplace/complementary-providers"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { LocationMap } from "@/components/marketplace/location-map"
import Image from "next/image"

export function ServiceDetailContent({ id }: { id: string }) {
    const { getAllServices } = useProvider()
    const [service, setService] = useState<any>(() => {
        const found = getAllServices().find(s => s.id === id)
        return found || null
    })
    const [loading, setLoading] = useState(!service)
    const [guestCount, setGuestCount] = useState<number>(0)

    useEffect(() => {
        if (!service) {
            const found = getAllServices().find(s => s.id === id)
            if (found) {
                setService(found)
            }
            setLoading(false)
        }
    }, [id, getAllServices, service])

    if (loading) return (
        <div className="container py-8 space-y-8 animate-pulse bg-ls-bg min-h-screen">
            <div className="h-8 w-64 bg-white/10 rounded mb-4" />
            <div className="aspect-video w-full bg-black/40 rounded-xl border border-white/5" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                </div>
            </div>
        </div>
    )

    if (!service) {
        return <div className="p-10 text-center text-white/50 bg-ls-bg min-h-screen pt-32">Servicio no encontrado</div>
    }

    const gallery = service.gallery && service.gallery.length > 0
        ? service.gallery
        : [service.image]

    return (
        <div className="min-h-screen bg-ls-bg text-white relative flex flex-col pt-12">
            <div className="absolute top-0 w-[500px] h-[500px] bg-ls-blue/5 rounded-full blur-[120px] pointer-events-none self-center" />
            <div className="container py-8 flex-grow relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-ls-cyan border-ls-cyan/30 bg-ls-cyan/10 backdrop-blur-md">{service.category}</Badge>
                            </div>
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <h1 className="ls-title text-3xl font-bold">{service.title}</h1>
                                <FavoriteButton serviceId={String(service.id)} variant="button" />
                            </div>
                            {service.verified && (
                                <div className="flex items-center text-ls-cyan font-medium mb-3 font-inter">
                                    <ShieldCheck className="w-4 h-4 mr-1 text-ls-cyan" />
                                    <span>Proveedor Verificado</span>
                                </div>
                            )}
                            <div className="flex items-center text-white/60 gap-4 text-sm font-inter">
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-white/40" /> {service.location}</span>
                                <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-ls-golden fill-ls-golden" /> {service.rating || 0} ({service.reviews || 0} reseñas)</span>
                            </div>
                        </div>

                        {/* Gallery Carousel */}
                        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/40 relative group shadow-lg border border-white/10 p-1">
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                    priority
                                />
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="absolute bottom-4 right-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-black/60 text-white hover:bg-black/80 border border-white/10 backdrop-blur-md">Ver todas las fotos</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
                                    <div className="relative w-full aspect-video bg-black/90 rounded-lg flex items-center justify-center border border-white/10">
                                        <Carousel className="w-full max-w-3xl">
                                            <CarouselContent>
                                                {gallery.map((img: string, index: number) => (
                                                    <CarouselItem key={index}>
                                                        <div className="relative aspect-video flex items-center justify-center">
                                                            <Image
                                                                src={img}
                                                                alt={`Gallery ${index}`}
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious className="left-4 bg-black/50 border-white/20 text-white hover:bg-black/80" />
                                            <CarouselNext className="right-4 bg-black/50 border-white/20 text-white hover:bg-black/80" />
                                        </Carousel>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Description */}
                        <div className="space-y-4 ls-glass p-6 md:p-8 rounded-xl bg-black/20 border border-white/5">
                            <h3 className="ls-title text-xl font-bold">Acerca del servicio</h3>
                            <p className="text-white/70 leading-relaxed whitespace-pre-wrap font-inter">
                                {service.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {["Wifi", "Estacionamiento", "Accesible", "Aire Acondicionado"].map(feat => (
                                    <div key={feat} className="flex items-center gap-2">
                                        <div className="bg-ls-cyan/10 p-1.5 rounded-full border border-ls-cyan/20"><Check className="w-3.5 h-3.5 text-ls-cyan" /></div>
                                        <span className="text-sm font-inter text-white/80">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="bg-white/10" />

                        {/* Map Integration */}
                        <div className="space-y-4 ls-glass p-6 md:p-8 rounded-xl bg-black/20 border border-white/5">
                            <h3 className="ls-title text-xl font-bold">Ubicación</h3>
                            <LocationMap location={service.location} />
                        </div>

                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <ServiceBookingCard
                                price={service.price}
                                unit={service.unit}
                                category={service.category}
                                serviceId={service.id}
                                providerId={service.providerId}
                                serviceName={service.title}
                                providerPhone={service.contactPhone}
                            />

                            {service.category === 'Locales y Salones' && (
                                <div className="space-y-4">
                                    <Card className="p-4 ls-glass bg-black/40 border-white/5 shadow-2xl backdrop-blur-xl">
                                        <Label htmlFor="guests-preview" className="flex items-center gap-2 mb-2 text-sm text-white/80">
                                            <Users className="w-4 h-4 text-ls-cyan" /> Estimación de Invitados
                                        </Label>
                                        <Input
                                            id="guests-preview"
                                            type="number"
                                            min={0}
                                            placeholder="¿Cuántos invitados esperas?"
                                            value={guestCount || ""}
                                            onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                                            className="ls-input border-white/10 bg-black/40 text-white focus:border-ls-cyan focus:ring-1 focus:ring-ls-cyan"
                                        />
                                    </Card>

                                    <ComplementaryProviders
                                        service={service}
                                        guestCount={guestCount}
                                    />
                                </div>
                            )}

                            <Separator className="bg-white/10" />

                            {/* Reviews */}
                            <div className="space-y-4 pb-12">
                                <h3 className="ls-title text-xl font-bold">Reseñas</h3>
                                <ReviewsList serviceId={service.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
