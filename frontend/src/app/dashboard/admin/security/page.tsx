"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShieldCheck, AlertTriangle, Key, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminSecurityPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Centro de Seguridad</h2>
                    <p className="text-muted-foreground">Auditoría, permisos y configuraciones de acceso críticas.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Estado de la plataforma</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 mt-4">
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Autenticación (Supabase)</span>
                                <span className="font-medium text-green-600">Correcto</span>
                            </li>
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Pagos (Stripe)</span>
                                <span className="font-medium text-green-600">Conectado (Live)</span>
                            </li>
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Servidor (Render)</span>
                                <span className="font-medium text-green-600">En línea</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Key className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Permisos de Administrador</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Reglas de acceso administrativo y configuración de correos oficiales.
                        </p>
                        <Button variant="outline" className="w-full">Gestionar Roles</Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <History className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">Audit Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-50 border rounded-lg p-6 text-center text-muted-foreground space-y-4">
                            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto opacity-50" />
                            <p>El registro detallado de eventos y métricas de seguridad requerirá la implementación de "pg_audit" en Supabase.</p>
                            <Button disabled>Activar Logging</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
