"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Activity as ActivityIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminActivityPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Monitor de Actividad</h2>
                    <p className="text-muted-foreground">Métricas generales de la plataforma y reportes.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">128</div>
                        <p className="text-xs text-muted-foreground">+14% respecto al mes anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Volumen Transaccional</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$124,500 MXN</div>
                        <p className="text-xs text-muted-foreground">+5.6% respecto al mes anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">12 nuevos este mes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                        <ActivityIcon className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2%</div>
                        <p className="text-xs text-muted-foreground">+1.2% respecto a la semana anterior</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="min-h-[400px] flex items-center justify-center border-dashed border-2">
                <div className="text-center">
                    <ActivityIcon className="w-16 h-16 text-muted-foreground opacity-30 mx-auto mb-4" />
                    <p className="text-xl font-medium text-slate-700">Gráfico de Crecimiento</p>
                    <p className="text-muted-foreground mt-2">Esta sección será integrada con datos de gráficos pronto.</p>
                </div>
            </Card>
        </div>
    )
}
