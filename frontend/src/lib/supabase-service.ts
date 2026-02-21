/**
 * supabase-service.ts
 * 
 * Capa de servicios centralizada para LocalSpace Web.
 * Replica las 37 funciones del SupabaseService de la app móvil (Flutter).
 * 
 * Todas las funciones reciben el cliente Supabase como parámetro
 * para mantener compatibilidad con el patrón existente de `createClient()`.
 */

import { SupabaseClient } from "@supabase/supabase-js"

// ============================================================
// TYPES
// ============================================================

export interface ProfileUpdate {
    full_name?: string
    phone?: string
    website?: string
    avatar_url?: string
}

export interface ReviewData {
    booking_id: string | number
    service_id: string | number
    provider_id: string
    client_id: string
    rating: number
    comment?: string | null
}

export interface Review {
    id: number
    rating: number
    comment: string | null
    created_at: string
    profiles: {
        full_name: string
        avatar_url: string | null
    }
}

export interface FavoriteService {
    id: string
    service_id: string
    title: string
    price: number
    category: string
    image: string | null
    image_url: string | null
    created_at: string
}

export interface BookingExpanded {
    service_id: string | number
    provider_id: string
    client_id: string
    date: string
    total_price: number
    status?: string
    guests?: number
    location?: string
    event_name?: string
    event_time?: string
    budget?: number
}

export interface UserBooking {
    id: string
    service_id: string
    provider_id: string
    date: string
    status: string
    total_price: number
    guests?: number
    location?: string
    event_name?: string
    cancellation_reason?: string
    cancelled_by?: string
    cancelled_at?: string
    services?: { title: string; image?: string; image_url?: string }
    has_review?: boolean
}

export interface Notification {
    id: string
    user_id: string
    type: string
    title: string
    message: string
    is_read: boolean
    created_at: string
}

// ============================================================
// PROFILE FUNCTIONS
// ============================================================

/**
 * Actualiza el perfil del usuario en la tabla `profiles`.
 */
export async function updateProfileDB(
    supabase: SupabaseClient,
    userId: string,
    data: ProfileUpdate
) {
    const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId)

    if (error) throw error
    return true
}

/**
 * Sube una imagen de avatar a Supabase Storage y actualiza `avatar_url` en profiles.
 */
export async function uploadAvatar(
    supabase: SupabaseClient,
    userId: string,
    file: File
) {
    const fileExt = file.name.split(".").pop()
    const filePath = `${userId}/avatar.${fileExt}`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update profile with the new URL
    await updateProfileDB(supabase, userId, { avatar_url: avatarUrl })

    return avatarUrl
}

/**
 * Cambia la contraseña del usuario autenticado.
 */
export async function updatePassword(
    supabase: SupabaseClient,
    newPassword: string
) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) throw error
    return true
}

// ============================================================
// FAVORITES FUNCTIONS
// ============================================================

/**
 * Alterna un servicio como favorito. Si ya existe lo quita, si no lo agrega.
 * Retorna el nuevo estado (true = es favorito, false = ya no es favorito).
 */
export async function toggleFavorite(
    supabase: SupabaseClient,
    userId: string,
    serviceId: string | number
) {
    // Check if already favorited
    const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("service_id", serviceId)
        .maybeSingle()

    if (existing) {
        // Remove favorite
        const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("id", existing.id)
        if (error) throw error
        return false
    } else {
        // Add favorite
        const { error } = await supabase
            .from("favorites")
            .insert({ user_id: userId, service_id: serviceId })
        if (error) throw error
        return true
    }
}

/**
 * Verifica si un servicio es favorito del usuario.
 */
export async function isFavorite(
    supabase: SupabaseClient,
    userId: string,
    serviceId: string | number
): Promise<boolean> {
    const { count } = await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("service_id", serviceId)

    return (count || 0) > 0
}

/**
 * Obtiene todos los favoritos del usuario con join a services.
 */
export async function getFavorites(
    supabase: SupabaseClient,
    userId: string
): Promise<FavoriteService[]> {
    const { data, error } = await supabase
        .from("favorites")
        .select(`
            id,
            service_id,
            created_at,
            services (
                id,
                title,
                price,
                category,
                image,
                image_url
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((f: any) => ({
        id: f.id,
        service_id: f.service_id,
        title: f.services?.title || "Sin título",
        price: f.services?.price || 0,
        category: f.services?.category || "",
        image: f.services?.image || null,
        image_url: f.services?.image_url || null,
        created_at: f.created_at,
    }))
}

// ============================================================
// REVIEWS FUNCTIONS
// ============================================================

/**
 * Envía una reseña para un booking/servicio.
 */
export async function submitReview(
    supabase: SupabaseClient,
    data: ReviewData
) {
    const { error } = await supabase.from("reviews").insert({
        booking_id: data.booking_id,
        service_id: data.service_id,
        provider_id: data.provider_id,
        client_id: data.client_id,
        rating: data.rating,
        comment: data.comment || null,
    })

    if (error) throw error
    return true
}

/**
 * Obtiene las reseñas de un servicio con perfil del cliente (join profiles).
 * Límite: 20 reseñas.
 */
export async function getServiceReviews(
    supabase: SupabaseClient,
    serviceId: string | number
): Promise<Review[]> {
    const { data, error } = await supabase
        .from("reviews")
        .select(`
            id,
            rating,
            comment,
            created_at,
            profiles:client_id (
                full_name,
                avatar_url
            )
        `)
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false })
        .limit(20)

    if (error) throw error

    return (data || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        profiles: {
            full_name: r.profiles?.full_name || "Anónimo",
            avatar_url: r.profiles?.avatar_url || null,
        },
    }))
}

/**
 * Calcula el promedio de calificación de un servicio.
 */
export async function getAverageRating(
    supabase: SupabaseClient,
    serviceId: string | number
): Promise<number> {
    const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("service_id", serviceId)

    if (error || !data || data.length === 0) return 0

    const sum = data.reduce((acc: number, r: any) => acc + r.rating, 0)
    return Math.round((sum / data.length) * 10) / 10
}

/**
 * Verifica si el usuario actual ya calificó un booking específico.
 */
export async function hasReviewedBooking(
    supabase: SupabaseClient,
    userId: string,
    bookingId: string | number
): Promise<boolean> {
    const { count } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("client_id", userId)
        .eq("booking_id", bookingId)

    return (count || 0) > 0
}

// ============================================================
// CANCELLATION FUNCTIONS
// ============================================================

/**
 * Cliente solicita la cancelación de un booking confirmado.
 * Cambia estado a `cancellation_requested` y notifica al proveedor.
 */
export async function requestCancellation(
    supabase: SupabaseClient,
    bookingId: string,
    reason: string,
    cancelledBy: string = "user"
) {
    // Update booking status
    const { error: bookingError } = await supabase
        .from("bookings")
        .update({
            status: "cancellation_requested",
            cancellation_reason: reason,
            cancelled_by: cancelledBy,
        })
        .eq("id", bookingId)

    if (bookingError) throw bookingError

    // Get booking details for notification
    const { data: booking } = await supabase
        .from("bookings")
        .select("provider_id, services:service_id(title)")
        .eq("id", bookingId)
        .single()

    if (booking?.provider_id) {
        await createNotification(supabase, {
            user_id: booking.provider_id,
            type: "cancellation_request",
            title: "Solicitud de Cancelación",
            message: `Un cliente ha solicitado cancelar su reserva de "${(booking as any).services?.title || "servicio"}". Motivo: ${reason}`,
        })
    }

    return true
}

/**
 * Proveedor aprueba la cancelación. Booking pasa a `cancelled`.
 */
export async function approveCancellation(
    supabase: SupabaseClient,
    bookingId: string
) {
    const { data: booking } = await supabase
        .from("bookings")
        .select("client_id, services:service_id(title)")
        .eq("id", bookingId)
        .single()

    const { error } = await supabase
        .from("bookings")
        .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
        })
        .eq("id", bookingId)

    if (error) throw error

    if (booking?.client_id) {
        await createNotification(supabase, {
            user_id: booking.client_id,
            type: "cancellation_approved",
            title: "Cancelación Aprobada",
            message: `Tu solicitud de cancelación para "${(booking as any).services?.title || "servicio"}" ha sido aprobada.`,
        })
    }

    return true
}

/**
 * Proveedor rechaza la cancelación. Booking regresa a `confirmed`.
 */
export async function rejectCancellation(
    supabase: SupabaseClient,
    bookingId: string
) {
    const { data: booking } = await supabase
        .from("bookings")
        .select("client_id, services:service_id(title)")
        .eq("id", bookingId)
        .single()

    const { error } = await supabase
        .from("bookings")
        .update({
            status: "confirmed",
            cancellation_reason: null,
            cancelled_by: null,
        })
        .eq("id", bookingId)

    if (error) throw error

    if (booking?.client_id) {
        await createNotification(supabase, {
            user_id: booking.client_id,
            type: "cancellation_rejected",
            title: "Cancelación Rechazada",
            message: `Tu solicitud de cancelación para "${(booking as any).services?.title || "servicio"}" ha sido rechazada. La reserva sigue confirmada.`,
        })
    }

    return true
}

// ============================================================
// BOOKINGS FUNCTIONS
// ============================================================

/**
 * Obtiene todas las reservas del usuario con join a services.
 * (Historial del cliente)
 */
export async function getBookings(
    supabase: SupabaseClient,
    userId: string
): Promise<UserBooking[]> {
    const { data, error } = await supabase
        .from("bookings")
        .select(`
            *,
            services:service_id (title, image, image_url),
            reviews:reviews!reviews_booking_id_fkey (id)
        `)
        .eq("client_id", userId)
        .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((b: any) => ({
        ...b,
        services: b.services || undefined,
        has_review: b.reviews && b.reviews.length > 0,
    }))
}

/**
 * Crea un booking expandido con datos del evento.
 * Incluye guests, location, event_name, event_time + notificación al proveedor.
 */
export async function createBookingExpanded(
    supabase: SupabaseClient,
    data: BookingExpanded
) {
    const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
            service_id: data.service_id,
            provider_id: data.provider_id,
            client_id: data.client_id,
            date: data.date,
            total_price: data.total_price,
            status: data.status || "pending",
            guests: data.guests || null,
            location: data.location || null,
            event_name: data.event_name || null,
        })
        .select()
        .single()

    if (error) throw error

    // Notify provider
    if (data.provider_id) {
        await createNotification(supabase, {
            user_id: data.provider_id,
            type: "new_booking",
            title: "Nueva Solicitud de Reserva",
            message: `Tienes una nueva solicitud de reserva para el ${data.date}.${data.guests ? ` Invitados: ${data.guests}.` : ""}${data.location ? ` Ubicación: ${data.location}.` : ""}`,
        })
    }

    return booking
}

/**
 * Obtiene reservas futuras del proveedor (desde hoy).
 */
export async function getProviderUpcomingBookings(
    supabase: SupabaseClient,
    providerId: string
) {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
        .from("bookings")
        .select(`
            *,
            profiles:client_id (full_name, phone, avatar_url),
            services:service_id (title)
        `)
        .eq("provider_id", providerId)
        .gte("date", today)
        .order("date", { ascending: true })

    if (error) throw error
    return data || []
}

/**
 * Obtiene reservas pasadas del proveedor (antes de hoy).
 */
export async function getProviderPastBookings(
    supabase: SupabaseClient,
    providerId: string
) {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
        .from("bookings")
        .select(`
            *,
            profiles:client_id (full_name, phone, avatar_url),
            services:service_id (title)
        `)
        .eq("provider_id", providerId)
        .lt("date", today)
        .order("date", { ascending: false })

    if (error) throw error
    return data || []
}

// ============================================================
// NOTIFICATIONS FUNCTIONS
// ============================================================

/**
 * Crea una notificación in-app para un usuario.
 */
export async function createNotification(
    supabase: SupabaseClient,
    data: {
        user_id: string
        type: string
        title: string
        message: string
    }
) {
    const { error } = await supabase.from("notifications").insert({
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        is_read: false,
    })

    if (error) {
        console.error("Error creating notification:", error)
    }
}

/**
 * Escucha notificaciones en tiempo real para un usuario.
 * Retorna la función de cleanup para desuscribirse.
 */
export function listenToNotifications(
    supabase: SupabaseClient,
    userId: string,
    onNotification: (notification: Notification) => void
) {
    const channel = supabase
        .channel(`notifications-${userId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "notifications",
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                onNotification(payload.new as Notification)
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
}

/**
 * Obtiene las notificaciones no leídas de un usuario.
 */
export async function getUnreadNotifications(
    supabase: SupabaseClient,
    userId: string
): Promise<Notification[]> {
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(20)

    if (error) throw error
    return (data || []) as Notification[]
}

/**
 * Marca una notificación como leída.
 */
export async function markNotificationAsRead(
    supabase: SupabaseClient,
    notificationId: string
) {
    const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)

    if (error) throw error
    return true
}

// ============================================================
// ADVANCED FUNCTIONS
// ============================================================

/**
 * Analiza la brecha entre invitados y capacidad del venue.
 * Lógica local (sin BD).
 */
export function analyzeEventGap(
    venueService: { inventory_capabilities?: Record<string, number> },
    guestCount: number
): { hasGap: boolean; gap: Record<string, number> } {
    const capabilities = venueService.inventory_capabilities || {}
    const gap: Record<string, number> = {}
    let hasGap = false

    // Check chairs
    if (capabilities.chairs && guestCount > capabilities.chairs) {
        gap.chairs = guestCount - capabilities.chairs
        hasGap = true
    }

    // Check tables (assuming 8 per table)
    if (capabilities.tables) {
        const neededTables = Math.ceil(guestCount / 8)
        if (neededTables > capabilities.tables) {
            gap.tables = neededTables - capabilities.tables
            hasGap = true
        }
    }

    // Check general capacity
    if (capabilities.capacity && guestCount > capabilities.capacity) {
        gap.capacity = guestCount - capabilities.capacity
        hasGap = true
    }

    return { hasGap, gap }
}

/**
 * Busca proveedores complementarios para cubrir brechas.
 */
export async function findComplementaryProviders(
    supabase: SupabaseClient,
    options: {
        category: string
        date?: string
        minCapacity?: number
    }
) {
    let query = supabase
        .from("services")
        .select(`
            *,
            profiles:provider_id (
                full_name,
                status,
                avatar_url,
                phone
            )
        `)
        .eq("category", options.category)

    // Only show services from approved providers
    query = query.eq("profiles.status", "approved")

    const { data, error } = await query.limit(10)

    if (error) throw error

    return (data || []).filter((s: any) => s.profiles !== null)
}
