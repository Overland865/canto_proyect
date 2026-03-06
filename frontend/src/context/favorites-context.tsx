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

        const wasFavorite = favoriteIds.has(serviceId)
        const expectedNextState = !wasFavorite

        // Optimistic update
        setFavoriteIds(prev => {
            const next = new Set(prev)
            if (expectedNextState) next.add(serviceId)
            else next.delete(serviceId)
            return next
        })

        try {
            const nowFavorite = await toggleFavService(supabase, user.id, serviceId)

            // Revert or adjust if DB result differs from optimistic
            if (nowFavorite !== expectedNextState) {
                setFavoriteIds(prev => {
                    const next = new Set(prev)
                    if (nowFavorite) next.add(serviceId)
                    else next.delete(serviceId)
                    return next
                })
            }

            // Sync favorites list
            if (!nowFavorite) {
                setFavorites(prev => prev.filter(f => String(f.service_id) !== serviceId))
            } else {
                // If it became a favorite, we might just reload the favorites list completely to be safe or add a stub
                loadFavorites()
            }

            return nowFavorite
        } catch (error: any) {
            console.error("Error toggling favorite:", error)
            const errMsg = error?.message || "Hubo un problema de conexión con la base de datos."
            import("sonner").then(({ toast }) => {
                toast.error("Error de base de datos", { description: errMsg, duration: 8000 })
            })

            // Revert optimistic update
            setFavoriteIds(prev => {
                const next = new Set(prev)
                if (wasFavorite) next.add(serviceId)
                else next.delete(serviceId)
                return next
            })
            return wasFavorite
        }
    }, [user, favoriteIds, supabase, loadFavorites])

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
