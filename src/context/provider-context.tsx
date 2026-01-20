"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"

export type Service = {
    id: string
    providerId: string
    title: string
    description: string
    category: string
    price: number
    unit?: string
    location: string
    type: "service" | "package"
    items?: string[]
    image?: string
    gallery?: string[]
    rating?: number
    reviews?: number
    verified?: boolean
}

type ProviderContextType = {
    services: Service[]
    addService: (service: Omit<Service, "id" | "providerId">) => void
    deleteService: (id: string) => void
    getMyServices: () => Service[]
    getAllServices: () => Service[]
    bookings: Booking[]
    updateBookingStatus: (id: string, status: Booking["status"]) => void
}

export type Booking = {
    id: string
    serviceId: string
    serviceName: string
    clientId: string
    clientName: string
    date: string
    time: string
    status: "pending" | "confirmed" | "rejected" | "completed"
    amount: number
    guests: number
    specifications?: string
}

const MOCK_BOOKINGS: Booking[] = [
    {
        id: "BK-7829",
        serviceId: "srv-1",
        serviceName: "Jardín Las Rosas",
        clientId: "usr-1",
        clientName: "Ana García",
        date: "24/05/2024",
        time: "14:00 - 22:00",
        status: "pending",
        amount: 15000,
        guests: 150,
        specifications: "La boda tendrá una temática vintage. Necesitamos espacio para la ceremonia civil en el jardín. Se requiere acceso para proveedores 4 horas antes."
    },
    {
        id: "BK-7830",
        serviceId: "srv-2",
        serviceName: "Paquete Boda Premium",
        clientId: "usr-2",
        clientName: "Carlos Rodríguez",
        date: "01/06/2024",
        time: "18:00 - 02:00",
        status: "confirmed",
        amount: 28000,
        guests: 200,
        specifications: "Menú vegetariano para 20 personas. Barra libre premium solicitada. Color principal de la decoración: Azul Rey."
    },
    {
        id: "BK-7831",
        serviceId: "srv-3",
        serviceName: "Mobiliario Vintage",
        clientId: "usr-3",
        clientName: "Sofía Martínez",
        date: "15/05/2024",
        time: "10:00 - 18:00",
        status: "completed",
        amount: 4500,
        guests: 50,
    }
]

const ProviderContext = createContext<ProviderContextType | undefined>(undefined)

export function ProviderProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [services, setServices] = useState<Service[]>([])
    const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS)

    const updateBookingStatus = (id: string, status: Booking["status"]) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    }


    useEffect(() => {
        // Load services from localStorage
        const storedServices = localStorage.getItem("mock_provider_services")
        if (storedServices) {
            setServices(JSON.parse(storedServices))
        } else {
            // Initialize with mock data from lib/data if empty
            // We need to map the static data to our Service type
            // Importing distinct initially to avoid SSR mismatch issues, but for now client-side load is fine
            const initialData = require("@/lib/data").services.map((s: any) => ({
                id: s.id,
                providerId: "system", // default provider
                title: s.title,
                category: s.category, // ensuring category maps correctly
                description: `Servicio profesional de ${s.title} ubicado en ${s.location}.`,
                price: s.price,
                location: s.location, // mapping location
                type: "service",
                image: s.image,
                gallery: [s.image, s.image, s.image], // mock gallery
                rating: s.rating,
                reviews: s.reviews,
                verified: s.verified
            }))
            setServices(initialData)
            localStorage.setItem("mock_provider_services", JSON.stringify(initialData))
        }
    }, [])


    useEffect(() => {
        localStorage.setItem("mock_provider_services", JSON.stringify(services))
    }, [services])

    const addService = (newServiceData: Omit<Service, "id" | "providerId">) => {
        if (!user) return

        const newService: Service = {
            ...newServiceData,
            id: Math.random().toString(36).substr(2, 9),
            providerId: user.email, // Using email as ID for this mock
        }

        setServices((prev) => [...prev, newService])
    }

    const deleteService = (id: string) => {
        setServices((prev) => prev.filter((s) => s.id !== id))
    }

    const getMyServices = () => {
        if (!user) return []
        return services.filter((s) => s.providerId === user.email)
    }

    const getAllServices = () => {
        return services
    }

    return (
        <ProviderContext.Provider
            value={{
                services,
                addService,
                deleteService,
                getMyServices,
                getAllServices,
                bookings,
                updateBookingStatus
            }}
        >
            {children}
        </ProviderContext.Provider>
    )
}

export function useProvider() {
    const context = useContext(ProviderContext)
    if (context === undefined) {
        throw new Error("useProvider must be used within a ProviderProvider")
    }
    return context
}
