"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { getStripe } from "@/lib/stripe"

interface ServiceBookingCardProps {
    price: number
    unit?: string
    category: string
    serviceId: string
    providerId: string
    serviceName: string
}

export function ServiceBookingCard({ price, unit, category, serviceId, providerId, serviceName }: ServiceBookingCardProps) {
    const { user } = useAuth()
    const [date, setDate] = useState<Date>()
    const [address, setAddress] = useState("")
    const [loading, setLoading] = useState(false)

    const isLocal = category === "Locales" || category === "Salones"

    const handlePayment = async () => {
        if (!user) {
            alert("Necesitas iniciar sesión para reservar.")
            window.location.href = "/login"
            return
        }

        if (!date) {
            alert("Por favor selecciona una fecha")
            return
        }
        if (!isLocal && !address) {
            alert("Por favor ingresa la dirección del evento")
            return
        }

        setLoading(true)

        try {
            // Crear sesión de checkout en el backend
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
            const response = await fetch(`${backendUrl}/stripe/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceId,
                    providerId,
                    serviceName,
                    price,
                    date: date.toISOString().split('T')[0],
                    address: address || null,
                    userId: user.id,
                    userEmail: user.email,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear sesión de pago')
            }

            // Redirigir a Stripe Checkout usando la URL
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No se recibió URL de checkout')
            }
        } catch (error: any) {
            console.error('Error:', error)
            alert(error.message || 'Error al procesar el pago')
            setLoading(false)
        }
    }

    return (
        <Card className="shadow-xl border-primary/10">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Desde ${price.toLocaleString()}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <span className="text-sm font-medium">Fecha del evento</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {!isLocal && (
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium">Dirección del evento</Label>
                        <Input
                            id="address"
                            placeholder="Calle, Número, Colonia..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                )}

                <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Reservar y Pagar
                        </>
                    )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Pago seguro procesado por Stripe. Tu reserva se confirmará inmediatamente.
                </p>
            </CardContent>
        </Card>
    )
}
