"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle } from "lucide-react"
import ReviewForm from "@/components/reviews/ReviewForm"

export default function UserBookingsPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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

    useEffect(() => {
        fetchBookings()
        if (!user) return
        const channel = supabase
            .channel('user-bookings-page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `client_id=eq.${user.id}` }, fetchBookings)
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [user])

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
                            {bookings.map(booking => (
                                <div key={booking.id} className="flex flex-col md:flex-row md:items-center border-b pb-6 last:border-0 last:pb-0 gap-4">
                                    <div className="space-y-1 flex-1">
                                        <p className="text-base font-bold">{booking.services?.title}</p>
                                        <p className="text-sm text-muted-foreground">Fecha: {booking.date}</p>
                                        <p className="text-sm font-bold text-primary">${(booking.total_price || 0).toLocaleString()}</p>
                                        {booking.status === 'rescheduled' && (
                                            <div className="flex items-center text-orange-600 bg-orange-50 p-2 rounded-md mt-2 text-sm">
                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                <span>Nueva fecha propuesta: <strong>{booking.proposed_date}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge variant={
                                            booking.status === 'completed' ? 'default' :
                                                booking.status === 'confirmed' ? 'default' :
                                                    booking.status === 'pending' ? 'secondary' :
                                                        booking.status === 'rescheduled' ? 'outline' : 'destructive'
                                        } className={
                                            booking.status === 'completed' ? 'bg-purple-600' :
                                                booking.status === 'confirmed' ? 'bg-green-600' :
                                                    booking.status === 'rescheduled' ? 'border-orange-500 text-orange-500' : ''
                                        }>
                                            {booking.status === 'completed' ? 'Completado' :
                                                booking.status === 'rescheduled' ? 'Reprogramación' :
                                                    booking.status === 'confirmed' ? 'Confirmado' :
                                                        booking.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                        </Badge>

                                        {booking.payment_status === 'paid' ? (
                                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Pagado</Badge>
                                        ) : (
                                            booking.status === 'confirmed' && (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handlePay(booking)}>
                                                    Pagar ahora
                                                </Button>
                                            )
                                        )}

                                        {booking.status === 'rescheduled' && (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleRescheduleResponse(booking, false)}>Rechazar</Button>
                                                <Button size="sm" onClick={() => handleRescheduleResponse(booking, true)}>Aceptar Nueva Fecha</Button>
                                            </div>
                                        )}
                                    </div>

                                    {booking.status === 'completed' && !booking.has_review && (
                                        <div className="w-full mt-3">
                                            <ReviewForm bookingId={booking.id} onReviewSubmitted={fetchBookings} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
