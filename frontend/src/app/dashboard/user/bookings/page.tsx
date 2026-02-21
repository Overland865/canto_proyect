"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle, XCircle, Star } from "lucide-react"
import ReviewForm from "@/components/reviews/ReviewForm"
import CancellationModal from "@/components/shared/cancellation-modal"
import { requestCancellation } from "@/lib/supabase-service"

// Status semaphore config matching the mobile app
const STATUS_CONFIG: Record<string, { label: string; color: string; badgeClass: string }> = {
    pending: { label: "Pendiente", color: "🟡", badgeClass: "bg-yellow-500 text-white" },
    confirmed: { label: "Confirmada", color: "🟢", badgeClass: "bg-green-600 text-white" },
    cancelled: { label: "Cancelada", color: "🔴", badgeClass: "bg-red-600 text-white" },
    cancellation_requested: { label: "Cancelación Solicitada", color: "🟠", badgeClass: "bg-orange-500 text-white" },
    rejected: { label: "Rechazada", color: "🔴", badgeClass: "bg-red-500 text-white" },
    completed: { label: "Completado", color: "🟣", badgeClass: "bg-purple-600 text-white" },
    rescheduled: { label: "Reprogramación", color: "🟠", badgeClass: "border-orange-500 text-orange-500 bg-transparent" },
}

export default function UserBookingsPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<any>(null)

    const fetchBookings = async () => {
        if (!user) return
        const { data } = await supabase
            .from('bookings')
            .select('*, services(title), reviews(id)')
            .eq('client_id', user.id)
            .order('created_at', { ascending: false })

        if (data) {
            const enriched = data.map(b => ({
                ...b,
                has_review: b.reviews && b.reviews.length > 0
            }))
            setBookings(enriched)
        }
        setLoading(false)
    }

    const handlePay = async (booking: any) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
            const response = await fetch(`${backendUrl}/stripe/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
                },
                body: JSON.stringify({
                    bookingId: booking.id,
                    serviceName: booking.services?.title || "Servicio",
                    price: booking.total_price,
                    userEmail: user?.email
                })
            })
            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || "Error al iniciar pago")
            }
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleRescheduleResponse = async (booking: any, accept: boolean) => {
        if (accept) {
            await supabase.from('bookings').update({
                status: 'confirmed',
                date: booking.proposed_date,
                proposed_date: null
            }).eq('id', booking.id)
        } else {
            await supabase.from('bookings').update({ status: 'rejected' }).eq('id', booking.id)
        }
        fetchBookings()
    }

    const handleCancelClick = (booking: any) => {
        setSelectedBooking(booking)
        setCancelModalOpen(true)
    }

    const handleCancelConfirm = async (reason: string) => {
        if (!selectedBooking || !user) return
        await requestCancellation(supabase, selectedBooking.id, reason, "user")
        fetchBookings()
    }

    useEffect(() => {
        fetchBookings()
        if (!user) return
        const channel = supabase
            .channel('user-bookings-page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `client_id=eq.${user.id}` }, fetchBookings)
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [user])

    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status] || { label: status, color: "⚪", badgeClass: "" }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Mis Eventos</h2>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> Todas mis solicitudes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground">Cargando...</p>
                    ) : bookings.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                            <p>No tienes solicitudes todavía.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {bookings.map(booking => {
                                const statusCfg = getStatusConfig(booking.status)
                                return (
                                    <div key={booking.id} className="flex flex-col md:flex-row md:items-center border-b pb-6 last:border-0 last:pb-0 gap-4">
                                        <div className="space-y-1 flex-1">
                                            <p className="text-base font-bold">{booking.services?.title}</p>
                                            <p className="text-sm text-muted-foreground">Fecha: {booking.date}</p>
                                            <p className="text-sm font-bold text-primary">${(booking.total_price || 0).toLocaleString()}</p>

                                            {/* Rescheduled notice */}
                                            {booking.status === 'rescheduled' && (
                                                <div className="flex items-center text-orange-600 bg-orange-50 p-2 rounded-md mt-2 text-sm">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    <span>Nueva fecha propuesta: <strong>{booking.proposed_date}</strong></span>
                                                </div>
                                            )}

                                            {/* Cancellation requested notice */}
                                            {booking.status === 'cancellation_requested' && (
                                                <div className="flex items-center text-orange-600 bg-orange-50 p-2 rounded-md mt-2 text-sm">
                                                    <AlertCircle className="w-4 h-4 mr-2" />
                                                    <span>Cancelación solicitada — esperando respuesta del proveedor.</span>
                                                </div>
                                            )}

                                            {/* Cancelled with reason */}
                                            {booking.status === 'cancelled' && booking.cancellation_reason && (
                                                <div className="flex items-center text-red-600 bg-red-50 p-2 rounded-md mt-2 text-sm">
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    <span>Motivo: {booking.cancellation_reason}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Status badge with semaphore colors */}
                                            <Badge className={statusCfg.badgeClass}>
                                                {statusCfg.label}
                                            </Badge>

                                            {/* Payment buttons (existing) */}
                                            {booking.payment_status === 'paid' ? (
                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Pagado</Badge>
                                            ) : (
                                                booking.status === 'confirmed' && (
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handlePay(booking)}>
                                                        Pagar ahora
                                                    </Button>
                                                )
                                            )}

                                            {/* Reschedule response buttons */}
                                            {booking.status === 'rescheduled' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleRescheduleResponse(booking, false)}>Rechazar</Button>
                                                    <Button size="sm" onClick={() => handleRescheduleResponse(booking, true)}>Aceptar Nueva Fecha</Button>
                                                </div>
                                            )}

                                            {/* Cancel button — only for confirmed bookings */}
                                            {booking.status === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleCancelClick(booking)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Cancelar
                                                </Button>
                                            )}
                                        </div>

                                        {/* Review form for completed bookings */}
                                        {booking.status === 'completed' && !booking.has_review && (
                                            <div className="w-full mt-3">
                                                <ReviewForm
                                                    bookingId={booking.id}
                                                    serviceId={booking.service_id}
                                                    providerId={booking.provider_id}
                                                    onReviewSubmitted={fetchBookings}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancellation Modal */}
            <CancellationModal
                open={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleCancelConfirm}
                serviceName={selectedBooking?.services?.title}
            />
        </div>
    )
}
