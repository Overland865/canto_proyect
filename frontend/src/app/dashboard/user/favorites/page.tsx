"use client"

import { useFavorites } from "@/context/favorites-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag } from "lucide-react"
import Link from "next/link"
import FavoriteButton from "@/components/shared/favorite-button"

export default function FavoritesPage() {
    const { favorites, isLoading, loadFavorites } = useFavorites()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Mis Favoritos</h2>
                <Button variant="outline" size="sm" onClick={loadFavorites} disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Actualizar"}
                </Button>
            </div>

            {isLoading && favorites.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                    <p>Cargando favoritos...</p>
                </div>
            ) : favorites.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground space-y-3">
                            <Heart className="h-12 w-12 mx-auto opacity-30" />
                            <h3 className="text-lg font-medium">No tienes favoritos aún</h3>
                            <p className="text-sm">
                                Explora el marketplace y guarda los servicios que más te gusten.
                            </p>
                            <Link href="/marketplace">
                                <Button variant="outline" className="mt-2">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Ir al Marketplace
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                        <Card key={fav.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative">
                                <div className="aspect-video bg-muted overflow-hidden">
                                    <img
                                        src={
                                            fav.image ||
                                            fav.image_url ||
                                            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop"
                                        }
                                        alt={fav.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute top-2 right-2">
                                    <FavoriteButton serviceId={String(fav.service_id)} />
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg line-clamp-1">{fav.title}</h3>
                                    {fav.category && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                            {fav.category}
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg font-bold text-primary">
                                    ${fav.price?.toLocaleString()}
                                </p>
                                <Link href={`/marketplace/${fav.service_id}`}>
                                    <Button variant="outline" size="sm" className="w-full mt-2">
                                        Ver Servicio
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
