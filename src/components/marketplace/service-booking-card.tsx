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
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"

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
    const supabase = createClient()
    const [date, setDate] = useState<Date>()
    const [address, setAddress] = useState("")

    const isLocal = category === "Locales" || category === "Salones"

    const handleQuote = async () => {
        if (!user) {
            alert("Necesitas iniciar sesión para reservar.")
            // Redirect to login could be added here
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

        const { error } = await supabase.from('bookings').insert({
            user_id: user.id,
            provider_id: providerId,
            service_id: serviceId,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            time: "14:00 - 22:00", // Default or user selected
            status: 'pending',
            price: price,
            guests: 100, // Default for now
            specifications: address ? `Dirección: ${address}` : "Sin especificaciones"
        })

        if (error) {
            console.error(error)
            alert("Error al solicitar la cotización: " + error.message)
        } else {
            alert("Cotización solicitada con éxito. El proveedor revisará tu fecha.")
            setAddress("")
            setDate(undefined)
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

                <Button className="w-full" size="lg" onClick={handleQuote}>
                    Solicitar Cotización
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Tu solicitud no es un compromiso de compra directa.
                </p>
            </CardContent>
        </Card>
    )
}
