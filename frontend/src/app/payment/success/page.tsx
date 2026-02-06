"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get('session_id')
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState<any>(null)

    useEffect(() => {
        const fetchBooking = async () => {
            if (!sessionId) {
                setLoading(false)
                return
            }

            const supabase = createClient()

            // Buscar el booking por session_id
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          services (
            title,
            image_url
          ),
          provider_profiles (
            business_name
          )
        `)
                .eq('stripe_session_id', sessionId)
                .single()

            if (error) {
                console.error('Error fetching booking:', error)
            } else {
                setBooking(data)
            }

            setLoading(false)
        }

        fetchBooking()
    }, [sessionId])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
                        ¡Pago Exitoso!
                    </CardTitle>
                    <p className="text-muted-foreground text-lg">
                        Tu reserva ha sido confirmada
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {booking ? (
                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2">Detalles de tu Reserva</h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Servicio</p>
                                        <p className="font-medium">{booking.services?.title || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Proveedor</p>
                                        <p className="font-medium">{booking.provider_profiles?.business_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Fecha</p>
                                        <p className="font-medium">{new Date(booking.date).toLocaleDateString('es-MX', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Monto Pagado</p>
                                        <p className="font-bold text-green-600 dark:text-green-400">
                                            ${booking.amount_paid?.toLocaleString('es-MX')} MXN
                                        </p>
                                    </div>
                                </div>

                                {booking.specifications && booking.specifications !== 'Sin especificaciones' && (
                                    <div>
                                        <p className="text-muted-foreground text-sm">Especificaciones</p>
                                        <p className="text-sm">{booking.specifications}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    📧 Hemos enviado un correo de confirmación con todos los detalles de tu reserva.
                                    El proveedor se pondrá en contacto contigo pronto.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                No se encontraron detalles de la reserva. Por favor, revisa tu correo electrónico.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            className="flex-1"
                            onClick={() => router.push('/dashboard/consumer')}
                        >
                            Ver Mis Reservas
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push('/marketplace')}
                        >
                            Explorar Más Servicios
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
