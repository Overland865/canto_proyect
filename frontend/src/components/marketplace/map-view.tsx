"use client"

import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ServicePoint {
    id: string
    title: string
    price: number
    location: string
    lat?: number // Mock coordinates
    lng?: number
}

interface MapViewProps {
    services: ServicePoint[]
    highlightedId?: string
}

export function MapView({ services, highlightedId }: MapViewProps) {
    // Mock function to generate random positions for demo since we don't have real coords
    const getPosition = (id: string, index: number) => {
        // Seeded random-ish positions to be consistent
        const x = ((id.charCodeAt(0) * 123 + index * 45) % 80) + 10
        const y = ((id.charCodeAt(0) * 67 + index * 89) % 80) + 10
        return { top: `${y}%`, left: `${x}%` }
    }

    return (
        <div className="w-full h-[calc(100vh-140px)] bg-slate-100 relative overflow-hidden rounded-xl border shadow-inner">
            {/* Mock Map Background */}
            <div
                className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Map_of_Mexico_City_metro.svg/1200px-Map_of_Mexico_City_metro.svg.png')] bg-cover bg-center grayscale"
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-slate-200/20 pointer-events-none" />

            {/* Pins */}
            {services.map((service, index) => {
                const style = getPosition(service.id, index)
                const isHighlighted = highlightedId === service.id

                return (
                    <div
                        key={service.id}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer group z-10 ${isHighlighted ? "z-20 scale-125" : "hover:scale-110"}`}
                        style={style}
                    >
                        <Button
                            size="sm"
                            className={`h-auto py-1 px-2 rounded-full shadow-lg border-2 relative ${isHighlighted ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/20" : "bg-white text-foreground border-white hover:bg-slate-50"}`}
                        >
                            <span className="text-xs font-bold">${service.price.toLocaleString()}</span>
                        </Button>
                        <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] mx-auto ${isHighlighted ? "border-t-primary" : "border-t-white"}`} />

                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                            <div className="font-bold truncate">{service.title}</div>
                            <div className="text-[10px] text-gray-300 truncate">{service.location}</div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black"></div>
                        </div>
                    </div>
                )
            })}

            {/* Floating Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button size="icon" variant="secondary" className="shadow-md bg-white border">
                    <span className="text-lg font-bold">+</span>
                </Button>
                <Button size="icon" variant="secondary" className="shadow-md bg-white border">
                    <span className="text-lg font-bold">-</span>
                </Button>
            </div>
        </div>
    )
}
