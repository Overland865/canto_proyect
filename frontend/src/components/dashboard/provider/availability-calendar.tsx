"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getProviderBlockedDates, getProviderBookedDates, toggleProviderBlockedDate } from "@/lib/supabase-service"

export function AvailabilityCalendar() {
    const { user } = useAuth()
    const [blockedDates, setBlockedDates] = useState<Date[]>([])
    const [bookedDates, setBookedDates] = useState<Date[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        if (!user) return
        try {
            const blocked = await getProviderBlockedDates(supabase, user.id)
            const booked = await getProviderBookedDates(supabase, user.id)
            setBlockedDates(blocked)
            setBookedDates(booked)
        } catch (error) {
            console.error("Error fetching availability:", error)
            toast.error("Error al cargar disponibilidad")
        }
    }

    useEffect(() => {
        fetchData()
    }, [user])

    const handleDayClick = async (day: Date) => {
        if (!user) return
        setLoading(true)

        const dateStr = format(day, "yyyy-MM-dd")

        // Check if booked (Priority)
        const isBooked = bookedDates.some(d => format(d, "yyyy-MM-dd") === dateStr)
        if (isBooked) {
            toast.info("Este día tiene una reserva confirmada.")
            setLoading(false)
            return
        }

        try {
            const nowBlocked = await toggleProviderBlockedDate(supabase, user.id, dateStr)
            toast.success(nowBlocked ? "Día bloqueado" : "Día desbloqueado")
            await fetchData() // Refresh
        } catch (error: any) {
            console.error(error)
            toast.error("Error al actualizar disponibilidad")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Calendario de Disponibilidad</span>
                    <div className="flex gap-2 text-xs font-normal">
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Bloqueado</Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Reservado</Badge>
                    </div>
                </CardTitle>
                <CardDescription>
                    Haz clic en un día para bloquearlo manualmentente.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    locale={es}
                    selected={undefined}
                    onSelect={(d) => d && handleDayClick(d)}
                    modifiers={{
                        blocked: blockedDates,
                        booked: bookedDates
                    }}
                    modifiersStyles={{
                        blocked: { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' },
                        booked: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' }
                    }}
                    disabled={loading}
                    className="rounded-md border p-6 w-fit"
                />
            </CardContent>
        </Card>
    )
}
