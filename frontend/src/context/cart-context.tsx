"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export type EventPlan = {
    eventName: string
    date: string
    time: string
    budget: number
    guests: number
    requiresVenue: boolean
    venueAddress?: string
    venueServiceId?: string
}

export type CartItem = {
    id: string
    title: string
    price: number
    description: string
    quantity: number
    image?: string
    category?: string
}

type CartContextType = {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, "quantity">) => void
    removeFromCart: (id: string) => void
    updateQuantity: (id: string, newQuantity: number) => void
    clearCart: () => void
    total: number
    itemCount: number
    eventPlan: EventPlan | null
    setEventPlan: (plan: EventPlan | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    const [isMounted, setIsMounted] = useState(false)
    const [items, setItems] = useState<CartItem[]>([])
    const [eventPlan, setEventPlan] = useState<EventPlan | null>(null)

    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== "undefined") {
            const storedCart = localStorage.getItem("mock_cart")
            if (storedCart) {
                try { setItems(JSON.parse(storedCart)) } catch (e) { }
            }
            const storedConfig = localStorage.getItem("mock_event_plan")
            if (storedConfig) {
                try { setEventPlan(JSON.parse(storedConfig)) } catch (e) { }
            }
        }
    }, [])

    useEffect(() => {
        if (!isMounted) return
        localStorage.setItem("mock_cart", JSON.stringify(items))
    }, [items, isMounted])

    useEffect(() => {
        if (!isMounted) return
        if (eventPlan) {
            localStorage.setItem("mock_event_plan", JSON.stringify(eventPlan))
        } else {
            localStorage.removeItem("mock_event_plan")
        }
    }, [eventPlan, isMounted])

    const addToCart = (newItem: Omit<CartItem, "quantity">) => {
        if (!isAuthenticated) {
            toast.error("Acceso denegado", {
                description: "Debes iniciar sesión para agregar servicios al carrito.",
                action: {
                    label: "Iniciar sesión",
                    onClick: () => router.push("/login")
                }
            })
            return
        }

        const isVenue = newItem.category?.toLowerCase().includes("local") ||
            newItem.category?.toLowerCase().includes("salon") ||
            newItem.category?.toLowerCase().includes("salón")

        setItems((prevItems) => {
            if (isVenue) {
                // If adding a venue, remove any existing venue in the cart
                const itemsWithoutVenue = prevItems.filter(item => {
                    const cat = item.category?.toLowerCase() || ""
                    return !(cat.includes("local") || cat.includes("salon") || cat.includes("salón"))
                })
                return [...itemsWithoutVenue, { ...newItem, quantity: 1 }]
            }

            const existingItem = prevItems.find((item) => item.id === newItem.id)
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prevItems, { ...newItem, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return
        setItems((prevItems) =>
            prevItems.map((item) => item.id === id ? { ...item, quantity: newQuantity } : item)
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                total,
                itemCount,
                eventPlan,
                setEventPlan,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
