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
    const [date, setDate] = useState<Date>()
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)
    const [blockedDates, setBlockedDates] = useState<Date[]>([])

    const supabase = createClient()

    useEffect(() => {
        const fetchAvailability = async () => {
            const { data } = await supabase
                .from('provider_availability')
                .select('date')
                .eq('provider_id', providerId)
                .eq('status', 'blocked')

            if (data) {
                const dates = data.map((d: any) => new Date(d.date))
                setBlockedDates(dates)
            }
        }
        if (providerId) fetchAvailability()
    }, [providerId, supabase])

    const handleBooking = async () => {
        if (!user) {
            toast.error("Inicia sesión para reservar")
            return
        }

        if (!date) {
            toast.error("Selecciona una fecha")
            return
        }

        setLoading(true)

        try {
            const { data, error } = await supabase.rpc('create_booking', {
                p_provider_id: providerId,
                p_service_id: parseInt(serviceId),
                p_date: date.toISOString(),
                p_total_price: price,
                p_notes: notes
            })

            if (error) throw error

            toast.success("Solicitud enviada con éxito", {
                description: "El proveedor revisará tu solicitud."
            })
            setDate(undefined)
            setNotes("")

        } catch (error: any) {
            console.error('Error:', error)
            toast.error("Error al enviar solicitud", {
                description: error.message
            })
        } finally {
            setLoading(false)
        }
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

    return (
        <Card className="shadow-xl border-primary/10 sticky top-24">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${price.toLocaleString()}</span>
                    {unit && <span className="text-sm font-normal text-muted-foreground">/{unit}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <span className="text-sm font-medium">Fecha deseada</span>
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
                                disabled={[
                                    { before: new Date() },
                                    ...blockedDates
                                ]}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">Notas o Dirección</Label>
                    <Input
                        id="notes"
                        placeholder="Detalles importantes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <Button
                    className="w-full font-bold text-md"
                    size="lg"
                    onClick={handleBooking}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <CalendarCheck className="mr-2 h-4 w-4" />
                            Solicitar Reserva
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    onClick={handleWhatsApp}
                >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contactar por WhatsApp
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                    No se realizará ningún cargo hasta que el proveedor acepte tu solicitud.
                </p>
            </CardContent>
        </Card>
    )
}
