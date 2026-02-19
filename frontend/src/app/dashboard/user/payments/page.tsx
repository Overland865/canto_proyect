"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle2, Clock } from "lucide-react"

export default function UserPaymentsPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPaidBookings = async () => {
            if (!user) return
            const { data } = await supabase
                .from('bookings')
                .select('*, services(title)')
                .eq('client_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setBookings(data)
            setLoading(false)
        }
        fetchPaidBookings()
    }, [user])

    const paid = bookings.filter(b => b.payment_status === 'paid')
    const pending = bookings.filter(b => b.payment_status !== 'paid' && b.status === 'confirmed')

    const totalPaid = paid.reduce((acc, b) => acc + (b.total_price || 0), 0)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Mis Pagos</h2>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">${totalPaid.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{paid.length} pagos realizados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pending.length}</div>
                        <p className="text-xs text-muted-foreground">Confirmados sin pagar</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-muted-foreground">Cargando...</p>
                    ) : paid.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
                            <p>Aún no has realizado ningún pago.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paid.map(booking => (
                                <div key={booking.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                    <div>
                                        <p className="font-semibold">{booking.services?.title}</p>
                                        <p className="text-sm text-muted-foreground">Fecha: {booking.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold">${(booking.total_price || 0).toLocaleString()}</p>
                                        <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Pagado
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
