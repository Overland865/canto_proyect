"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase/client"

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
    addService: (service: Omit<Service, "id" | "providerId">) => Promise<void>
    updateService: (id: string, updates: Partial<Service>) => Promise<void>
    deleteService: (id: string) => Promise<void>
    getMyServices: () => Service[]
    getAllServices: () => Service[]
    bookings: Booking[]
    updateBookingStatus: (id: string, status: Booking["status"], proposedDate?: Date) => Promise<void>
    isLoading: boolean
    user: any
}

export type Booking = {
    id: string
    serviceId: string
    serviceName: string
    clientId: string
    clientName: string
    date: string
    time: string
    status: "pending" | "confirmed" | "rejected" | "completed" | "rescheduled"
    amount: number
    guests: number
    specifications?: string
    proposedDate?: string
}

const MOCK_SERVICES: Service[] = [
    {
        id: "srv-1",
        providerId: "prov-1",
        title: "Jardín Las Rosas",
        description: "Hermoso jardín para eventos al aire libre. Incluye carpa y servicios básicos.",
        category: "Locales y Salones",
        price: 15000,
        location: "Zona Norte",
        type: "service",
        rating: 4.8,
        reviews: 24,
        verified: true,
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "srv-2",
        providerId: "prov-2",
        title: "Banquete Premium",
        description: "Servicio de banquete a 3 tiempos con opciones vegetarianas y servicio de meseros.",
        category: "Banquetes",
        price: 450,
        unit: "pp",
        location: "A domicilio",
        type: "service",
        rating: 4.9,
        reviews: 15,
        verified: true,
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "srv-3",
        providerId: "prov-3",
        title: "DJ & Iluminación Pro",
        description: "Paquete completo de sonido e iluminación para fiestas de hasta 300 personas.",
        category: "Música y Shows",
        price: 8000,
        location: "Toda la ciudad",
        type: "service",
        rating: 4.7,
        reviews: 32,
        verified: true,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "srv-4",
        providerId: "prov-4",
        title: "Fotografía Documental",
        description: "Cobertura completa de tu evento por 8 horas. Entrega digital en alta resolución.",
        category: "Foto y Video",
        price: 12000,
        location: "Toda la ciudad",
        type: "service",
        rating: 5.0,
        reviews: 8,
        verified: false,
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1638&auto=format&fit=crop"
    }
]

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
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    const fetchServices = async () => {
        console.log("Fetching services (lite)...")
        // Select all fields except heavy images/gallery for the main list to improve performance
        const { data, error } = await supabase
            .from('services')
            .select('id, provider_id, title, description, category, price, location, type, rating, reviews, verified')

        if (error) {
            console.error("Error fetching services:", error)
        }
        if (data) {
            console.log("Services fetched:", data.length)
            // Map DB fields to Service type (snake_case to camelCase)
            const mappedServices = data.map((s: any) => ({
                ...s,
                providerId: s.provider_id,
                // Ensure other fields match if DB columns differ from Service type
            }))
            setServices(mappedServices)
        }
    }

    const fetchBookings = async () => {
        if (!user || user.role !== 'provider') return

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                profiles:user_id (full_name),
                services:service_id (title)
            `)
            .eq('provider_id', user.id) // Assuming user.id is the UUID

        if (data) {
            const mappedBookings: Booking[] = data.map((b: any) => ({
                id: b.id,
                serviceId: b.service_id,
                serviceName: b.services?.title || 'Unknown Service',
                clientId: b.user_id,
                clientName: b.profiles?.full_name || 'Unknown Client',
                date: b.date,
                time: b.time,
                status: b.status,
                amount: b.price || 0,
                guests: b.guests,
                specifications: b.specifications,
                proposedDate: b.proposed_date
            }))
            setBookings(mappedBookings)
        }
    }

    const updateBookingStatus = async (id: string, status: Booking["status"], proposedDate?: Date) => {
        const updateData: any = { status }
        if (proposedDate) {
            updateData.proposed_date = proposedDate.toISOString().split('T')[0] // formatting as YYYY-MM-DD
        }

        const { error } = await supabase.from('bookings').update(updateData).eq('id', id)

        if (!error) {
            // Optimistic update
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status, proposedDate: updateData.proposed_date } : b))
        } else {
            console.error("Error updating booking:", error)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

    useEffect(() => {
        if (user) {
            fetchBookings()

            // Realtime subscription
            const channel = supabase
                .channel('provider-bookings')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `provider_id=eq.${user.id}`
                }, (payload) => {
                    fetchBookings() // Refresh on change
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user])



    const addService = async (newServiceData: Omit<Service, "id" | "providerId">) => {
        if (!user) return

        const { data, error } = await supabase.from('services').insert({
            ...newServiceData,
            provider_id: user.id
        }).select().single()

        if (data && !error) {
            const newService: Service = {
                ...data,
                providerId: data.provider_id
            }
            setServices((prev) => [...prev, newService])
        }
    }

    const deleteService = async (id: string) => {
        const { error } = await supabase.from('services').delete().eq('id', id)
        if (!error) {
            setServices((prev) => prev.filter((s) => s.id !== id))
        }
    }

    const updateService = async (id: string, updates: Partial<Service>) => {
        // Prepare updates for DB (exclude non-DB fields if any, or map them)
        const dbUpdates: any = { ...updates }
        delete dbUpdates.id
        delete dbUpdates.providerId

        // Map camelCase to snake_case if needed (e.g. providerId -> provider_id)
        if (updates.providerId) dbUpdates.provider_id = updates.providerId

        const { error } = await supabase
            .from('services')
            .update(dbUpdates)
            .eq('id', id)

        if (!error) {
            setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
        } else {
            throw error
        }
    }

    const getMyServices = () => {
        if (!user) return []
        return services.filter((s) => s.providerId === user.id)
    }


    const getAllServices = () => {
        return services
    }

    return (
        <ProviderContext.Provider
            value={{
                services,
                addService,
                updateService,
                deleteService,
                getMyServices,
                getAllServices,
                bookings,
                updateBookingStatus,
                isLoading,
                user: useAuth().user
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
