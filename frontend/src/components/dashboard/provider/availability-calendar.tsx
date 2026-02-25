"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { useProvider, type Booking } from "@/context/provider-context"
import { toast } from "sonner"
import { format, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { getProviderBlockedDates, toggleProviderBlockedDate } from "@/lib/supabase-service"
import { Clock, User, Briefcase, Activity, Landmark, Users } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function AvailabilityCalendar() {
    const { user } = useAuth()
    const { bookings } = useProvider()
    const [blockedDates, setBlockedDates] = useState<Date[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [loading, setLoading] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const supabase = createClient()

    const fetchBlockedDates = async () => {
        if (!user) return
        try {
            const blocked = await getProviderBlockedDates(supabase, user.id)
            setBlockedDates(blocked)
        } catch (error) {
            console.error("Error fetching blocked dates:", error)
        }
    }

    useEffect(() => {
        fetchBlockedDates()
    }, [user])

    // Derive booked dates from context
    const bookedDates = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'pending')
        .map(b => parseISO(b.date))

    const bookingsForSelectedDate = selectedDate
        ? bookings.filter(b => isSameDay(parseISO(b.date), selectedDate))
        : []

    const handleDayClick = async (day: Date) => {
        if (!user) return
        setSelectedDate(day)

        const dateStr = format(day, "yyyy-MM-dd")
        const isBooked = bookings.some(b => b.date === dateStr && (b.status === 'confirmed' || b.status === 'pending'))

        if (isBooked) return

        setLoading(true)
        try {
            const nowBlocked = await toggleProviderBlockedDate(supabase, user.id, dateStr)
            toast.success(nowBlocked ? "Día bloqueado" : "Día desbloqueado")
            await fetchBlockedDates()
        } catch (error: any) {
            console.error(error)
            toast.error("Error al actualizar disponibilidad")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid lg:grid-cols-5 gap-6 items-start">
            {/* Left Column: Calendar Card */}
            <Card className="lg:col-span-2 shadow-sm border-slate-200">
                <CardHeader className="pb-4 border-b bg-slate-50/30">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold text-slate-800">Calendario</CardTitle>
                        <div className="flex gap-3 text-[10px] items-center">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm shadow-sm"></div>
                                <span className="text-slate-500 uppercase tracking-tighter font-semibold">Bloqueado</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-sm shadow-sm"></div>
                                <span className="text-slate-500 uppercase tracking-tighter font-semibold">Reservado</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center p-4">
                    <Calendar
                        mode="single"
                        locale={es}
                        selected={selectedDate}
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
                        className="rounded-md border-0 w-full max-w-sm"
                    />
                </CardContent>
                <CardFooter className="pt-0 border-t bg-slate-50/50 p-4 rounded-b-lg">
                    <p className="text-xs text-muted-foreground text-center w-full italic">
                        Selecciona un día para gestionar disponibilidad o ver reservas.
                    </p>
                </CardFooter>
            </Card>

            {/* Right Column: Bookings Details */}
            <Card className="lg:col-span-3 shadow-sm min-h-[480px] flex flex-col border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">
                                {selectedDate ? format(selectedDate, "PPPP", { locale: es }) : "Seleccione una fecha"}
                            </CardTitle>
                            <CardDescription className="capitalize font-medium text-primary/80">
                                {bookingsForSelectedDate.length} {bookingsForSelectedDate.length === 1 ? 'reserva para hoy' : 'reservas registradas'}
                            </CardDescription>
                        </div>
                        {selectedDate && (
                            <Badge variant="outline" className="bg-white px-3 py-1 shadow-sm text-slate-600 border-slate-200">
                                {format(selectedDate, "dd/MM/yyyy")}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 bg-white">
                    {bookingsForSelectedDate.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                                <Clock className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="max-w-[250px]">
                                <h3 className="font-semibold text-slate-900 text-base">Día libre de reservas</h3>
                                <p className="text-sm text-slate-500 mt-1">No hay eventos programados en esta fecha seleccionada.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {bookingsForSelectedDate.map((booking) => (
                                <div
                                    key={booking.id}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="group cursor-pointer relative overflow-hidden p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                    <Briefcase className="w-5 h-5 text-primary" />
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-lg leading-tight">{booking.serviceName}</h4>
                                            </div>

                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    {booking.clientName}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {booking.time}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-between self-stretch gap-4">
                                            <Badge
                                                variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                                                className={`
                                                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                    ${booking.status === 'confirmed'
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-sm'
                                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 shadow-sm'}
                                                `}
                                            >
                                                {booking.status === 'confirmed' ? 'Confirmada' :
                                                    booking.status === 'pending' ? 'Pendiente' :
                                                        booking.status === 'cancelled' ? 'Cancelada' : booking.status}
                                            </Badge>
                                            <div className="text-right">
                                                <span className="text-xs text-slate-400 font-medium block">Total</span>
                                                <span className="text-2xl font-black text-slate-900 tracking-tight">${booking.amount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Accent line for visual separation */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${booking.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t p-4 flex justify-center">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
                        <Activity className="w-3 h-3" />
                        Centro de eventos
                    </div>
                </CardFooter>
            </Card>

            {/* Detailed Booking Dialog */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
                    <div className="bg-slate-900 text-white p-8">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-2xl font-black text-center tracking-tight">Detalle de Reserva</DialogTitle>
                            <DialogDescription className="text-slate-400 text-center text-sm font-medium">
                                Información del cliente y servicio
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedBooking && (
                        <div className="p-8 space-y-8 bg-white">
                            {/* Client Info Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Cliente</span>
                                    <span className="text-slate-900 font-bold text-base">{selectedBooking.clientName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Teléfono</span>
                                    <span className="text-slate-900 font-bold text-base">{selectedBooking.clientPhone || 'No especificado'}</span>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Service Details Section */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Servicio</span>
                                    <span className="text-slate-900 font-bold text-right max-w-[200px] leading-tight">{selectedBooking.serviceName}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Precio</span>
                                    <span className="text-slate-900 font-black text-xl">${selectedBooking.amount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Estado</span>
                                    <Badge
                                        variant="outline"
                                        className={`font-black tracking-widest uppercase text-[10px] px-3 py-1 ${selectedBooking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                            }`}
                                    >
                                        {selectedBooking.status}
                                    </Badge>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Logistics Section */}
                            <div className="space-y-4 pb-4">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-bold uppercase tracking-wider text-[11px]">Fecha</span>
                                    </div>
                                    <span className="text-slate-800 font-semibold">{format(parseISO(selectedBooking.date), "dd MMM yyyy", { locale: es })}, {selectedBooking.time}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Landmark className="w-4 h-4" />
                                        <span className="font-bold uppercase tracking-wider text-[11px]">Ubicación</span>
                                    </div>
                                    <span className="text-slate-800 font-semibold text-right max-w-[180px] leading-tight">{selectedBooking.location || 'No especificada'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Users className="w-4 h-4" />
                                        <span className="font-bold uppercase tracking-wider text-[11px]">Invitados</span>
                                    </div>
                                    <span className="text-slate-800 font-semibold">{selectedBooking.guests} personas</span>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    onClick={() => setSelectedBooking(null)}
                                    className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-all shadow-lg active:scale-95"
                                >
                                    Cerrar
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
