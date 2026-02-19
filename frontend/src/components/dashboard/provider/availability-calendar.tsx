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

export function AvailabilityCalendar() {
    const { user } = useAuth()
    const [blockedDates, setBlockedDates] = useState<Date[]>([])
    const [bookedDates, setBookedDates] = useState<Date[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        if (!user) return

        // Fetch Blocked Dates
        const { data: blockedData, error: blockedError } = await supabase
            .from('provider_availability')
            .select('date')
            .eq('provider_id', user.id)
            .eq('status', 'blocked')

        if (blockedData) {
            setBlockedDates(blockedData.map((d: any) => new Date(d.date))) // These are strings like "2024-01-01" or timestamps, date constructor handles iso strings usually. DB checks might be needed if date type is date only.
            // Supabase date column returns YYYY-MM-DD string. new Date("YYYY-MM-DD") works but might be UTC or local depending on browser. 
            // Ideally we need to be careful with timezones. Best is to handle everything as UTC or use date-fns parse.
            // For simplicity in this demo, blocked dates are full days.
            // Using new Date(d.date + 'T12:00:00') helps avoid timezone shifts if running locally.
            // Or just parsing the string components.
            // Let's assume standard ISO for now.
            setBlockedDates(blockedData.map((d: any) => new Date(d.date + "T12:00:00")))
        }

        // Fetch Confirmed Bookings
        const { data: bookedData, error: bookedError } = await supabase
            .from('bookings')
            .select('date')
            .eq('provider_id', user.id)
            .eq('status', 'confirmed')

        if (bookedData) {
            setBookedDates(bookedData.map((d: any) => new Date(d.date)))
        }
    }

    useEffect(() => {
        fetchData()
    }, [user])

    const handleDayClick = async (day: Date) => {
        if (!user) return
        setLoading(true)

        // Check if date is blocked or booked
        // Simple equality check is tricky with dates. Compare ISO strings YYYY-MM-DD.
        const dateStr = format(day, "yyyy-MM-dd")

        // Check if booked (Priority)
        const isBooked = bookedDates.some(d => format(d, "yyyy-MM-dd") === dateStr)
        if (isBooked) {
            toast.info("Este día tiene una reserva confirmada.")
            setLoading(false)
            return
        }

        // Check if blocked
        const isBlocked = blockedDates.some(d => format(d, "yyyy-MM-dd") === dateStr)

        try {
            if (isBlocked) {
                // Unblock: Delete from DB
                const { error } = await supabase
                    .from('provider_availability')
                    .delete()
                    .eq('provider_id', user.id)
                    .eq('date', dateStr)

                if (error) throw error
                toast.success("Día desbloqueado")
            } else {
                // Block: Insert into DB
                const { error } = await supabase
                    .from('provider_availability')
                    .insert({
                        provider_id: user.id,
                        date: dateStr,
                        status: 'blocked'
                    })

                if (error) throw error
                toast.success("Día bloqueado")
            }
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
