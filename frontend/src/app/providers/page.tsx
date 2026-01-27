"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, ShieldCheck, ArrowRight } from "lucide-react"
import { providers } from "@/lib/data"

export default function ProvidersPage() {
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.map((provider) => (
                    <Link href={`/providers/${provider.id}`} key={provider.id} className="group h-full">
                        <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all border-muted">
                            <div className="relative aspect-video overflow-hidden">
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
                                    {provider.categories.map((cat, i) => (
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
                                <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform p-0 hover:bg-transparent">
                                    Ver Perfil <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
