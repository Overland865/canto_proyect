"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { useAuth } from "./auth-context"
import { createClient } from "@/lib/supabase/client"
import {
    toggleFavorite as toggleFavService,
    isFavorite as isFavService,
    getFavorites as getFavService,
    FavoriteService,
} from "@/lib/supabase-service"

interface FavoritesContextType {
    favorites: FavoriteService[]
    favoriteIds: Set<string>
    isLoading: boolean
    toggleFavorite: (serviceId: string) => Promise<boolean>
    isFavorite: (serviceId: string) => boolean
    loadFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const supabase = createClient()
    const [favorites, setFavorites] = useState<FavoriteService[]>([])
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)
    const [loaded, setLoaded] = useState(false)

    const loadFavorites = useCallback(async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const data = await getFavService(supabase, user.id)
            setFavorites(data)
            setFavoriteIds(new Set(data.map(f => String(f.service_id))))
            setLoaded(true)
        } catch (error) {
            console.error("Error loading favorites:", error)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Lazy load favorites on first access
    React.useEffect(() => {
        if (user && !loaded) {
            loadFavorites()
        }
        if (!user) {
            setFavorites([])
            setFavoriteIds(new Set())
            setLoaded(false)
        }
    }, [user, loaded, loadFavorites])

    const toggleFavorite = useCallback(async (serviceId: string): Promise<boolean> => {
        if (!user) return false
        try {
            const nowFavorite = await toggleFavService(supabase, user.id, serviceId)
            // Optimistic update
            if (nowFavorite) {
                setFavoriteIds(prev => new Set(prev).add(serviceId))
            } else {
                setFavoriteIds(prev => {
                    const next = new Set(prev)
                    next.delete(serviceId)
                    return next
                })
                setFavorites(prev => prev.filter(f => String(f.service_id) !== serviceId))
            }
            return nowFavorite
        } catch (error) {
            console.error("Error toggling favorite:", error)
            return false
        }
    }, [user])

    const isFavorite = useCallback((serviceId: string): boolean => {
        return favoriteIds.has(serviceId)
    }, [favoriteIds])

    return (
        <FavoritesContext.Provider value={{
            favorites,
            favoriteIds,
            isLoading,
            toggleFavorite,
            isFavorite,
            loadFavorites,
        }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider")
    }
    return context
}
