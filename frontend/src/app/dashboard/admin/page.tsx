"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Activity, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboardRoot() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                    <p className="text-muted-foreground mt-2">Bienvenido al centro de control oculto de Local_Space.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gestión de Proveedores</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Aprobar, rechazar o suspender cuentas de negocios.
                        </p>
                        <Link href="/dashboard/admin/providers">
                            <Button className="w-full" size="sm">Ver Proveedores</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Gestión de clientes y proveedores registrados en la plataforma.
                        </p>
                        <Link href="/dashboard/admin/users">
                            <Button className="w-full" size="sm" variant="outline">Ver Usuarios</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monitor de Actividad</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Métricas globales de reservas y ganancias generadas.
                        </p>
                        <Link href="/dashboard/admin/activity">
                            <Button className="w-full" size="sm" variant="outline">Ver Métricas</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Seguridad</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            Auditoría de logs y registros de autenticación del sistema.
                        </p>
                        <Link href="/dashboard/admin/security">
                            <Button className="w-full" size="sm" variant="outline">Ver Logs</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
