// src/types/index.ts

export interface ProfileUpdate {
    full_name?: string
    phone?: string
    website?: string
    avatar_url?: string
    cover_image?: string
    gallery?: string[]
    social_media?: any
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

export interface ServiceData {
    id?: string
    provider_id?: string
    title: string
    description: string
    category: string
    price: number
    location: string
    capacity?: number
    image?: string | null
    gallery?: string[]
}
