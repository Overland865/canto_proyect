"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationMapProps {
    location: string
    title?: string
}

export function LocationMap({ location, title }: LocationMapProps) {
    if (!location) return null

    // For demonstration, we use Google Maps Embed API
    // In production, the user should provide an API key.
    // For now, we'll use a standard search link for the iframe.
    const encodedLocation = encodeURIComponent(location)
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedLocation}`

    // Fallback URL if no API key is provided (using standard search)
    const fallbackUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`

    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`

    return (
        <Card className="overflow-hidden border-primary/10">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Ubicación
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
                    <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
                        Abrir en Maps <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </Button>
            </CardHeader>
            <CardContent className="p-0 border-t">
                <div className="aspect-[16/9] w-full bg-muted relative">
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={fallbackUrl}
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </div>
                <div className="p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground line-clamp-1">{location}</p>
                </div>
            </CardContent>
        </Card>
    )
}
