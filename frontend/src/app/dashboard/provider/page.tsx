"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CircleDollarSign, Users, Activity, AlertCircle, Plus } from "lucide-react"
import { useProvider } from "@/context/provider-context"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { AvailabilityCalendar } from "@/components/dashboard/provider/availability-calendar"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { format, subDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SummaryTab } from "@/components/dashboard/provider/summary-tab"
import { BookingsTab } from "@/components/dashboard/provider/bookings-tab"
import { ServicesTab } from "@/components/dashboard/provider/services-tab"
import { useState, useEffect } from "react"

export default function ProviderDashboardPage() {
    const { user } = useAuth()
    const { getMyServices, deleteService, bookings, updateBookingStatus } = useProvider()
    const myServices = getMyServices()
    const supabase = createClient()
    const [views, setViews] = useState(0)

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return
            const { data } = await supabase
                .from('provider_profiles')
                .select('views')
                .eq('id', user.id)
                .single()

            if (data) setViews(data.views || 0)
        }
        fetchStats()
    }, [user])

    // Calculate Stats
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length

    // Calculate Total Income (Confirmed or Completed)
    const income = bookings.reduce((sum, booking) => {
        if (booking.status === 'confirmed' || booking.status === 'completed') {
            return sum + (booking.amount || 0)
        }
        return sum
    }, 0)

    // Prepare Chart Data (Last 7 Days)
    const chartData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        const dayIncome = bookings.reduce((sum, b) => {
            if ((b.status === 'confirmed' || b.status === 'completed') && b.date) {
                const bDate = new Date(b.date)
                if (isSameDay(bDate, date)) {
                    return sum + (b.amount || 0)
                }
            }
            return sum
        }, 0)
        return {
            name: format(date, 'EEE', { locale: es }),
            income: dayIncome,
            fullDate: format(date, 'PP', { locale: es })
        }
    })

    if (!user || user.role !== "provider") {
        return <div>Acceso denegado. Este panel es solo para proveedores.</div>
    }

    return (
        <div className="space-y-6 container py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Panel de Proveedor</h2>
                    <p className="text-muted-foreground">Bienvenido, {user.businessName || user.name}</p>
                </div>
                <Link href="/dashboard/provider/services/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Publicar Nuevo Servicio
                    </Button>
                </Link>
            </div>

            {/* Verification Integrity */}
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verificación Pendiente</AlertTitle>
                <AlertDescription>
                    Para publicar tus servicios, necesitas completar la verificación de identidad.
                    <Button variant="link" className="p-0 h-auto font-bold ml-1 text-destructive underline">Subir documentos</Button>
                </AlertDescription>
            </Alert>

            {/* Dashboard Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 w-full md:w-auto h-auto grid grid-cols-2 md:inline-flex">
                    <TabsTrigger value="overview" className="px-6 py-2">Resumen</TabsTrigger>
                    <TabsTrigger value="bookings" className="px-6 py-2">Reservas</TabsTrigger>
                    <TabsTrigger value="services" className="px-6 py-2">Mis Servicios</TabsTrigger>
                    <TabsTrigger value="availability" className="px-6 py-2">Disponibilidad</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <SummaryTab
                        income={income}
                        pendingBookings={pendingBookings}
                        totalBookings={totalBookings}
                        chartData={chartData}
                    />
                </TabsContent>

                <TabsContent value="bookings">
                    <BookingsTab
                        bookings={bookings}
                        updateStatus={updateBookingStatus}
                    />
                </TabsContent>

                <TabsContent value="services">
                    <ServicesTab
                        services={myServices}
                        onDelete={deleteService}
                    />
                </TabsContent>

                <TabsContent value="availability">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <AvailabilityCalendar />
                        <Card className="h-full bg-slate-50 border-dashed">
                            <CardHeader>
                                <CardTitle>Gestión de Disponibilidad</CardTitle>
                                <CardDescription>Mantén tu calendario actualizado para asegurar reservas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                                <p>✓ Los días en <span className="font-bold text-green-600">Verde</span> son reservas confirmadas.</p>
                                <p>✓ Los días en <span className="font-bold text-red-600">Rojo</span> son días que has bloqueado manualmente.</p>
                                <p>✓ Haz clic en un día libre para bloquearlo si no puedes atender eventos.</p>
                                <p>✓ Haz clic en un día bloqueado para liberarlo y aceptar reservas nuevamente.</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
