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
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { CalendarDays, Clock, MapPin, Check, X, Eye, FileText } from "lucide-react"
import { useProvider, Booking } from "@/context/provider-context"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function BookingsPage() {
    const { bookings, updateBookingStatus } = useProvider()
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [proposedDate, setProposedDate] = useState<Date | undefined>(undefined)

    const handleStatusChange = (id: string, newStatus: Booking["status"]) => {
        updateBookingStatus(id, newStatus)
    }

    const openDetails = (booking: Booking) => {
        setSelectedBooking(booking)
        setIsDetailsOpen(true)
        setIsRescheduling(false)
        setProposedDate(undefined)
    }

    // Filter mainly pending/confirmed for this view or sort by date? 
    const bookingsOnDate = (date: Date) => {
        return bookings.filter(b => {
            // Mock data is DD/MM/YYYY.
            const [day, month, year] = b.date.split('/')
            // Note: month is 0-indexed in Date constructor
            const bookingDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            return bookingDate.toDateString() === date.toDateString()
        })
    }

    // Create an array of Date objects for markers
    const bookedDates = bookings.map(b => {
        const [day, month, year] = b.date.split('/')
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reservas</h2>
                    <p className="text-muted-foreground">Gestiona las solicitudes de reserva para tus servicios.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={showCalendar ? "bg-secondary" : ""}
                    >
                        {showCalendar ? <FileText className="mr-2 h-4 w-4" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                        {showCalendar ? "Ver Lista" : "Ver Calendario"}
                    </Button>
                    <Button>
                        Nueva Reserva Manual
                    </Button>
                </div>
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
                                // Highlight days with bookings
                                modifiers={{
                                    booked: bookedDates
                                }}
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
                            <CardDescription>
                                Reservas para este día
                            </CardDescription>
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
                        <CardTitle>Solicitudes Recientes</CardTitle>
                        <CardDescription>
                            Tienes {bookings.filter(b => b.status === 'pending').length} solicitudes pendientes de aprobación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Servicio</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.id}</TableCell>
                                            <TableCell>{booking.serviceName}</TableCell>
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
                                                <Badge variant={
                                                    booking.status === 'confirmed' ? 'default' :
                                                        booking.status === 'pending' ? 'secondary' :
                                                            booking.status === 'rejected' ? 'destructive' : 'outline'
                                                } className={
                                                    booking.status === 'confirmed' ? 'bg-green-600 hover:bg-green-700' :
                                                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''
                                                }>
                                                    {booking.status === 'confirmed' ? 'Confirmada' :
                                                        booking.status === 'pending' ? 'Pendiente' :
                                                            booking.status === 'rejected' ? 'Rechazada' : 'Completada'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                ${booking.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Ver Detalle"
                                                        onClick={() => openDetails(booking)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                title="Aprobar"
                                                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                title="Rechazar"
                                                                onClick={() => handleStatusChange(booking.id, 'rejected')}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
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

            {/* Dialog Details */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalle de la Solicitud</DialogTitle>
                        <DialogDescription>
                            ID: {selectedBooking?.id}
                        </DialogDescription>
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
                                    <p className="text-sm font-medium text-muted-foreground">Invitados/Cantidad</p>
                                    <p className="font-semibold">{selectedBooking.guests}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <h4 className="flex items-center font-medium gap-2">
                                    <FileText className="w-4 h-4" /> Especificaciones del Evento
                                </h4>
                                <div className="bg-muted p-4 rounded-md text-sm leading-relaxed">
                                    {selectedBooking.specifications || "Sin especificaciones adicionales."}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedBooking?.status === 'pending' && !isRescheduling && (
                            <div className="flex gap-2 w-full justify-between">
                                <Button variant="ghost" onClick={() => setIsRescheduling(true)}>Reprogramar</Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => {
                                        if (selectedBooking) handleStatusChange(selectedBooking.id, 'rejected')
                                        setIsDetailsOpen(false)
                                    }}>Rechazar</Button>
                                    <Button onClick={() => {
                                        if (selectedBooking) handleStatusChange(selectedBooking.id, 'confirmed')
                                        setIsDetailsOpen(false)
                                    }}>Aprobar Solicitud</Button>
                                </div>
                            </div>
                        )}
                        {isRescheduling && (
                            <div className="w-full space-y-4">
                                <div className="p-4 border rounded-md">
                                    <h4 className="mb-2 font-medium">Selecciona una nueva fecha:</h4>
                                    <div className="flex justify-center">
                                        <Calendar
                                            mode="single"
                                            selected={proposedDate}
                                            onSelect={setProposedDate}
                                            initialFocus
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setIsRescheduling(false)}>Cancelar</Button>
                                    <Button disabled={!proposedDate} onClick={() => {
                                        if (selectedBooking && proposedDate) {
                                            updateBookingStatus(selectedBooking.id, 'rescheduled', proposedDate)
                                            setIsDetailsOpen(false)
                                        }
                                    }}>Enviar Propuesta</Button>
                                </div>
                            </div>
                        )}
                        {selectedBooking?.status !== 'pending' && (
                            <Button onClick={() => setIsDetailsOpen(false)}>Cerrar</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
