"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { CalendarDays, Clock, Eye, Check, X, FileText, AlertTriangle } from "lucide-react"
import { Booking } from "@/context/provider-context"
import { useState } from "react"
import { approveCancellation, rejectCancellation } from "@/lib/supabase-service"
import { createClient } from "@/lib/supabase/client"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface BookingsTabProps {
    bookings: Booking[]
    updateStatus: (id: string, status: Booking["status"], proposedDate?: Date) => void
}

export function BookingsTab({ bookings, updateStatus }: BookingsTabProps) {
    const supabase = createClient()
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [proposedDate, setProposedDate] = useState<Date | undefined>(undefined)

    const handleApproveCancellation = async (bookingId: string) => {
        try {
            await approveCancellation(supabase, bookingId)
            updateStatus(bookingId, 'cancelled')
        } catch (error) {
            console.error("Error approving cancellation:", error)
        }
    }

    const handleRejectCancellation = async (bookingId: string) => {
        try {
            await rejectCancellation(supabase, bookingId)
            updateStatus(bookingId, 'confirmed')
        } catch (error) {
            console.error("Error rejecting cancellation:", error)
        }
    }

    const openDetails = (booking: Booking) => {
        setSelectedBooking(booking)
        setIsDetailsOpen(true)
        setIsRescheduling(false)
        setProposedDate(undefined)
    }

    const parseBookingDate = (dateStr: string) => {
        if (!dateStr) return new Date()
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-')
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/')
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }
        return new Date(dateStr)
    }

    const bookingsOnDate = (date: Date) => {
        return bookings.filter(b => {
            const bookingDate = parseBookingDate(b.date)
            return bookingDate.toDateString() === date.toDateString()
        })
    }

    const bookedDates = bookings.map(b => parseBookingDate(b.date))

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => setShowCalendar(!showCalendar)}
                >
                    {showCalendar ? <FileText className="mr-2 h-4 w-4" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                    {showCalendar ? "Ver Lista" : "Ver Calendario"}
                </Button>
            </div>

            {showCalendar ? (
                <div className="grid md:grid-cols-[300px_1fr] gap-6 animate-in fade-in duration-500">
                    <Card>
                        <CardContent className="p-4 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow-sm"
                                locale={es}
                                modifiers={{ booked: bookedDates }}
                                modifiersStyles={{
                                    booked: { fontWeight: "bold", textDecoration: "underline", color: "var(--primary)" }
                                }}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : "Selecciona una fecha"}
                            </CardTitle>
                            <CardDescription>Reservas para esta fecha</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {date && bookingsOnDate(date).length > 0 ? (
                                <div className="space-y-4">
                                    {bookingsOnDate(date).map(booking => (
                                        <div key={booking.id} className="flex items-center justify-between border p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-lg">{booking.time}</span>
                                                    <Badge variant={
                                                        booking.status === 'confirmed' ? 'default' :
                                                            booking.status === 'pending' ? 'secondary' :
                                                                booking.status === 'rejected' ? 'destructive' : 'outline'
                                                    }>
                                                        {booking.status === 'confirmed' ? 'Confirmada' :
                                                            booking.status === 'pending' ? 'Pendiente' :
                                                                booking.status === 'rejected' ? 'Rechazada' : 'Completada'}
                                                    </Badge>
                                                </div>
                                                <p className="font-medium">{booking.clientName}</p>
                                                <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => openDetails(booking)}>Ver Detalles</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    No hay reservas para esta fecha.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Solicitudes de Reserva</CardTitle>
                        <CardDescription>
                            Tienes {bookings.filter(b => b.status === 'pending').length} solicitudes pendientes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Servicio</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Fecha/Hora</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.serviceName}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{booking.clientName}</span>
                                                    <span className="text-xs text-muted-foreground">{booking.guests} invitados</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="flex items-center"><CalendarDays className="mr-1 h-3 w-3" /> {booking.date}</span>
                                                    <span className="flex items-center text-muted-foreground"><Clock className="mr-1 h-3 w-3" /> {booking.time}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    booking.status === 'confirmed' ? 'bg-green-600 hover:bg-green-700' :
                                                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                                            booking.status === 'cancellation_requested' ? 'border-orange-500 text-orange-600 bg-orange-50' :
                                                                booking.status === 'cancelled' ? 'bg-red-600' : ''
                                                }>
                                                    {booking.status === 'confirmed' ? 'Confirmada' :
                                                        booking.status === 'pending' ? 'Pendiente' :
                                                            booking.status === 'cancellation_requested' ? '⚠ Cancelación' :
                                                                booking.status === 'cancelled' ? 'Cancelada' :
                                                                    booking.status === 'rejected' ? 'Rechazada' : 'Completada'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                ${booking.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openDetails(booking)}><Eye className="h-4 w-4" /></Button>
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <Button variant="outline" size="icon" className="text-green-600" onClick={() => updateStatus(booking.id, 'confirmed')}><Check className="h-4 w-4" /></Button>
                                                            <Button variant="outline" size="icon" className="text-red-600" onClick={() => updateStatus(booking.id, 'rejected')}><X className="h-4 w-4" /></Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalle de la Solicitud</DialogTitle>
                        <DialogDescription>ID: {selectedBooking?.id}</DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                                    <p className="font-semibold">{selectedBooking.clientName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Servicio</p>
                                    <p className="font-semibold">{selectedBooking.serviceName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
                                    <p className="font-semibold">{selectedBooking.date}</p>
                                    <p className="text-sm">{selectedBooking.time}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Invitados</p>
                                    <p className="font-semibold">{selectedBooking.guests}</p>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <h4 className="flex items-center font-medium gap-2"><FileText className="w-4 h-4" /> Especificaciones</h4>
                                <div className="bg-muted p-4 rounded-md text-sm">
                                    {selectedBooking.specifications || "Sin especificaciones adicionales."}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedBooking?.status === 'cancellation_requested' && (
                            <div className="flex justify-end gap-2 w-full">
                                <Button variant="outline" onClick={() => { if (selectedBooking) handleRejectCancellation(selectedBooking.id); setIsDetailsOpen(false); }}>Rechazar</Button>
                                <Button variant="destructive" onClick={() => { if (selectedBooking) handleApproveCancellation(selectedBooking.id); setIsDetailsOpen(false); }}>Aprobar</Button>
                            </div>
                        )}
                        {selectedBooking?.status === 'pending' && !isRescheduling && (
                            <div className="flex gap-2 w-full justify-between">
                                <Button variant="ghost" onClick={() => setIsRescheduling(true)}>Reprogramar</Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => { if (selectedBooking) updateStatus(selectedBooking.id, 'rejected'); setIsDetailsOpen(false); }}>Rechazar</Button>
                                    <Button onClick={() => { if (selectedBooking) updateStatus(selectedBooking.id, 'confirmed'); setIsDetailsOpen(false); }}>Aprobar</Button>
                                </div>
                            </div>
                        )}
                        {isRescheduling && (
                            <div className="w-full space-y-4">
                                <Calendar mode="single" selected={proposedDate} onSelect={setProposedDate} />
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setIsRescheduling(false)}>Cancelar</Button>
                                    <Button onClick={() => { if (selectedBooking) updateStatus(selectedBooking.id, 'rescheduled', proposedDate); setIsDetailsOpen(false); }}>Enviar</Button>
                                </div>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
