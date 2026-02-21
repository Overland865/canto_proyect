"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/context/favorites-context"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
    serviceId: string
    variant?: "icon" | "button"
    className?: string
}

export default function FavoriteButton({
    serviceId,
    variant = "icon",
    className,
}: FavoriteButtonProps) {
    const { user } = useAuth()
    const { isFavorite, toggleFavorite } = useFavorites()
    const [isToggling, setIsToggling] = useState(false)

    const isFav = isFavorite(String(serviceId))

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user || isToggling) return
        setIsToggling(true)
        try {
            await toggleFavorite(String(serviceId))
        } finally {
            setIsToggling(false)
        }
    }

    // Don't render for guests
    if (!user) return null

    if (variant === "icon") {
        return (
            <button
                onClick={handleToggle}
                disabled={isToggling}
                className={cn(
                    "p-2 rounded-full transition-all duration-200 hover:scale-110",
                    isFav
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-400 hover:text-red-400",
                    isToggling && "opacity-50",
                    className
                )}
                title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
                <Heart
                    className={cn("h-5 w-5 transition-all", isFav && "fill-current")}
                />
            </button>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
            className={cn(
                "gap-2",
                isFav && "border-red-300 text-red-500",
                className
            )}
        >
            <Heart className={cn("h-4 w-4", isFav && "fill-current text-red-500")} />
            {isFav ? "Guardado" : "Guardar"}
        </Button>
    )
}
