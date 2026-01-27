"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, ShieldCheck, Mail, Phone, Globe, ArrowLeft, Instagram, Facebook } from "lucide-react"
import { providers } from "@/lib/data"

export default function ProviderDetailsPage() {
    const params = useParams()
    const id = params.id as string
    const provider = providers.find((p) => p.id === id)

    if (!provider) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Proveedor no encontrado</h1>
                <Link href="/providers">
                    <Button>Volver al catálogo</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <img
                    src={provider.images[0]}
                    alt={provider.name}
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                {/* Navigation Buttons */}
                <div className="absolute top-4 left-4 z-10">
                    <Link href="/providers">
                        <Button variant="secondary" size="sm" className="gap-2 shadow-md backdrop-blur-md bg-background/50 hover:bg-background/80">
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Button>
                    </Link>
                </div>

                <div className="container absolute bottom-0 left-1/2 -translate-x-1/2 pb-8 md:pb-12">
                    <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="relative">
                                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
                                    <AvatarImage src={provider.images[0]} alt={provider.name} />
                                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {provider.verified && (
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md" title="Verificado">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2 mb-2">
                                <h1 className="text-3xl md:text-5xl font-bold text-foreground drop-shadow-sm">{provider.name}</h1>
                                <div className="flex flex-wrap gap-2 items-center text-sm md:text-base text-muted-foreground bg-background/50 backdrop-blur-sm p-2 rounded-lg w-fit">
                                    <MapPin className="w-4 h-4" /> {provider.location}
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center text-primary font-bold">
                                        <Star className="w-4 h-4 mr-1 fill-primary" /> {provider.rating} ({provider.reviews} reseñas)
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-2">
                            <Button size="lg" className="shadow-lg min-w-[140px]">Contactar</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sobre Nosotros</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                {provider.description}
                            </p>
                            <div className="flex gap-2 mt-6">
                                {provider.categories.map((cat, i) => (
                                    <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gallery */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Galería</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {provider.images.map((img, index) => (
                                    <div key={index} className="aspect-video rounded-lg overflow-hidden border bg-muted">
                                        <img
                                            src={img}
                                            alt={`Galería ${index + 1}`}
                                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500 cursor-pointer"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                <Phone className="w-5 h-5 text-primary mr-3" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Teléfono</p>
                                    <p className="font-medium">{provider.contact.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                <Mail className="w-5 h-5 text-primary mr-3" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium truncate max-w-[200px]" title={provider.contact.email}>{provider.contact.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 rounded-lg bg-muted/50">
                                <Globe className="w-5 h-5 text-primary mr-3" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Sitio Web</p>
                                    <p className="font-medium truncate max-w-[200px]">{provider.contact.website}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Redes Sociales</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <Button variant="outline" className="w-full justify-start h-12">
                                <Instagram className="w-5 h-5 mr-3 text-pink-500" />
                                {provider.social.instagram}
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12">
                                <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                                {provider.social.facebook}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
