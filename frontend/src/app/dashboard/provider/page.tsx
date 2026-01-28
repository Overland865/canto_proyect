"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CircleDollarSign, Users, Activity, AlertCircle, Plus } from "lucide-react"
import { useProvider } from "@/context/provider-context"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ProviderDashboardPage() {
    const { user } = useAuth()
    const { getMyServices, deleteService, bookings } = useProvider()
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

    // Calculate Total Income (Confirmed or Completed)
    const income = bookings.reduce((sum, booking) => {
        if (booking.status === 'confirmed' || booking.status === 'completed') {
            return sum + (booking.amount || 0)
        }
        return sum
    }, 0)

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

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">Ingresos confirmados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myServices.length}</div>
                        <p className="text-xs text-muted-foreground">Servicios publicados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vistas de Perfil</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{views}</div>
                        <p className="text-xs text-muted-foreground">Visualizaciones totales</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Listings */}
            <h3 className="text-xl font-bold mt-8">Mis Servicios</h3>
            {myServices.length === 0 ? (
                <div className="text-center py-10 border border-dashed rounded-lg bg-muted/50">
                    <h3 className="text-lg font-medium text-muted-foreground">No tienes servicios publicados</h3>
                    <p className="text-sm text-muted-foreground mt-2">Crea tu primer servicio o paquete para empezar a vender.</p>
                    <Link href="/dashboard/provider/services/new">
                        <Button className="mt-4" variant="outline">Crear Servicio</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myServices.map((service) => (
                        <Card key={service.id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                                    <Badge variant={service.type === 'package' ? "default" : "secondary"}>
                                        {service.type === 'package' ? 'Paquete' : 'Servicio'}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video bg-muted rounded-md mb-2 overflow-hidden">
                                    {service.image ? (
                                        <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin Imagen</div>
                                    )}
                                </div>
                                <p className="font-bold text-lg">${service.price.toLocaleString()}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Link href={`/dashboard/provider/services/${service.id}`}>
                                    <Button variant="ghost">Editar</Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de eliminar este servicio?')) {
                                            deleteService(service.id)
                                        }
                                    }}
                                >
                                    Eliminar
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
