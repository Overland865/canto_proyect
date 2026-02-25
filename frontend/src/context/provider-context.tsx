"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
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
    providerAvatar?: string
    businessName?: string
    contactPhone?: string
    capacity?: number
    tables?: number
    chairs?: number
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
    clientPhone?: string
    clientEmail?: string
    date: string
    time: string
    location?: string
    status: "pending" | "confirmed" | "rejected" | "completed" | "rescheduled" | "cancellation_requested" | "cancelled"
    amount: number
    guests: number
    specifications?: string
    proposedDate?: string
    cancellationReason?: string
    cancelledBy?: string
    cancelledAt?: string
}



const ProviderContext = createContext<ProviderContextType | undefined>(undefined)

export function ProviderProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [services, setServices] = useState<Service[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])


    const fetchServices = useCallback(async () => {
        console.log("Fetching services...")
        setIsLoading(true)

        try {
            const { data, error } = await supabase
                .from('services')
                .select(`
                    *,
                    profiles!provider_id (
                        status,
                        full_name,
                        phone,
                        avatar_url
                    )
                `)
                .eq('profiles.status', 'approved')

            if (error) {
                console.error("Error fetching services:", error)
                return
            }

            if (data) {
                console.log("Services fetched:", data.length)
                const mappedServices = data.map((s: any) => ({
                    id: s.id,
                    providerId: s.provider_id,
                    title: s.title,
                    description: s.description,
                    category: s.category,
                    price: s.price,
                    unit: s.unit || undefined,
                    location: s.profiles?.full_name || "Ubicación desconocida",
                    type: "service",
                    items: [],
                    image: s.image || s.image_url || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
                    gallery: s.gallery || [],
                    rating: s.rating || 0,
                    reviews: s.reviews || 0,
                    verified: s.is_verified,
                    businessName: s.profiles?.full_name,
                    contactPhone: s.profiles?.phone,
                    providerAvatar: s.profiles?.avatar_url || "",
                    capacity: s.capacity,
                    tables: s.tables,
                    chairs: s.chairs
                }))

                const finalServices = mappedServices.map((s: any) => ({
                    ...s,
                    location: s.businessName || "Online"
                }))
                setServices(finalServices)
            }
        } finally {
            setIsLoading(false)
        }
    }, [supabase])

    const fetchBookings = useCallback(async () => {
        if (!user || user.role !== 'provider') return

        console.log("DEBUG - Fetching bookings for provider:", user.id)

        try {
            // Try with join first
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    profiles:client_id (full_name, phone, email),
                    services:service_id (title, location)
                `)
                .eq('provider_id', user.id)

            if (error) {
                console.warn("Join fetch failed, trying fallback:", error.message)

                // Fallback: Fetch bookings only
                const { data: bookingsData, error: bookingsError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('provider_id', user.id)

                if (bookingsError) {
                    console.error("Fallback fetch also failed:", bookingsError)
                    return
                }

                if (bookingsData) {
                    // Manual join resolution
                    const resolvedBookings = await Promise.all(bookingsData.map(async (b: any) => {
                        // Fetch profile
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('full_name, phone, email')
                            .eq('id', b.client_id)
                            .single()

                        // Fetch service
                        const { data: service } = await supabase
                            .from('services')
                            .select('title, location')
                            .eq('id', b.service_id)
                            .single()

                        return {
                            id: b.id,
                            serviceId: b.service_id,
                            serviceName: service?.title || 'Servicio desconocido',
                            clientId: b.client_id,
                            clientName: profile?.full_name || 'Cliente (Nombre no disponible)',
                            clientPhone: profile?.phone || 'No especificado',
                            clientEmail: profile?.email || '',
                            date: b.date,
                            time: b.time,
                            location: service?.location || 'No especificada',
                            status: b.status,
                            amount: b.total_price || 0,
                            guests: b.guests,
                            specifications: b.specifications,
                            proposedDate: b.proposed_date,
                        } as Booking
                    }))
                    setBookings(resolvedBookings)
                }
            } else if (data) {
                console.log("Bookings fetched with join:", data.length)
                const mappedBookings: Booking[] = data.map((b: any) => ({
                    id: b.id,
                    serviceId: b.service_id,
                    serviceName: b.services?.title || 'Servicio desconocido',
                    clientId: b.client_id,
                    clientName: b.profiles?.full_name || 'Cliente (Nombre no disponible)',
                    clientPhone: b.profiles?.phone || 'No especificado',
                    clientEmail: b.profiles?.email || '',
                    date: b.date,
                    time: b.time,
                    location: b.services?.location || 'No especificada',
                    status: b.status,
                    amount: b.total_price || 0,
                    guests: b.guests,
                    specifications: b.specifications,
                    proposedDate: b.proposed_date,
                    cancellationReason: b.cancellation_reason,
                    cancelledBy: b.cancelled_by,
                    cancelledAt: b.cancelled_at,
                }))
                setBookings(mappedBookings)
            }
        } catch (err) {
            console.error("Critical error in fetchBookings:", err)
        }
    }, [user, supabase])

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
    }, [fetchServices])

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
                }, () => {
                    fetchBookings() // Refresh on change
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user, fetchBookings, supabase])



    const addService = async (newServiceData: Omit<Service, "id" | "providerId">) => {
        if (!user) return

        // Ensure gallery is included in insert
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
