"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, CalendarCheck, Loader2, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import EventContextModal from "@/components/shared/event-context-modal"
import { useCart } from "@/context/cart-context"

interface ServiceBookingCardProps {
    price: number
    unit?: string
    category: string
    serviceId: string
    providerId: string
    serviceName: string
    providerPhone?: string
}

export function ServiceBookingCard({ price, unit, category, serviceId, providerId, serviceName, providerPhone }: ServiceBookingCardProps) {
    const { user } = useAuth()
    const { addToCart, items } = useCart()

    const handleAddToCart = () => {
        // En lugar de requerir fecha ahora, simplemente lo agregamos al carrito
        // El carrito se encarga de recolectar detalles adicionales si es necesario
        addToCart({
            id: serviceId,
            title: serviceName,
            price: price,
            description: "Servicio agregado",
            image: "", // Could pass image if we had it
            category: category
        })
        toast.success("Agregado al carrito", {
            description: "El servicio se ha guardado para cotización."
        })
    }



    const handleWhatsApp = () => {
        if (!providerPhone) {
            toast.error("Número no disponible")
            return
        }
        // Basic cleaning
        const cleanPhone = providerPhone.replace(/\D/g, '')
        const finalPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone
        window.open(`https://wa.me/${finalPhone}`, '_blank')
    }

    const isInCart = items.some(item => item.id === serviceId)

    return (
        <Card className="shadow-2xl border-white/5 ls-glass bg-black/40 backdrop-blur-xl">
            <CardHeader className="pb-4">
                <CardTitle className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-4xl font-bold font-outfit text-ls-lemon">${price.toLocaleString()}</span>
                    {unit && <span className="text-sm font-normal text-white/50 font-inter pb-1">/{unit}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-ls-cyan/5 border border-ls-cyan/20 rounded-lg p-4 flex items-start gap-3">
                    <CalendarCheck className="w-5 h-5 text-ls-cyan shrink-0 mt-0.5" />
                    <p className="text-sm font-inter text-white/80 leading-relaxed">
                        Selecciona fechas y detalles de ubicación directamente <strong className="text-ls-cyan font-semibold">desde el carrito</strong> al completar tu solicitud.
                    </p>
                </div>

                <Button
                    className="w-full font-bold text-md h-12 ls-btn-cta bg-gradient-to-r from-ls-blue to-ls-cyan text-white shadow-[0_0_15px_rgba(0,201,255,0.3)] hover:shadow-[0_0_25px_rgba(0,201,255,0.5)] border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isInCart}
                >
                    {isInCart ? (
                        <>
                            <CalendarCheck className="mr-2 h-5 w-5" />
                            En el carrito
                        </>
                    ) : (
                        <>
                            <CalendarCheck className="mr-2 h-5 w-5" />
                            Agregar al carrito
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    className="w-full border-green-500/50 text-green-400 bg-green-500/5 hover:bg-green-500/10 hover:text-green-300 transition-colors h-12"
                    onClick={handleWhatsApp}
                >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contactar por WhatsApp
                </Button>

                <p className="text-xs text-center text-white/40 mt-4 font-inter">
                    No se realizará ningún cargo hasta que el proveedor acepte tu solicitud.
                </p>
            </CardContent>
        </Card>
    )
}
