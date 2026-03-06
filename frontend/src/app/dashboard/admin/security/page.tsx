"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShieldCheck, AlertTriangle, Key, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminSecurityPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                    <Button variant="outline" size="icon" className="border-purple-500/30 hover:bg-purple-500/20 hover:text-white bg-[#1a103c]/50 text-slate-300">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text pb-1">Centro de Seguridad</h2>
                    <p className="text-slate-400">Auditoría, permisos y configuraciones de acceso críticas.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <ShieldCheck className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-lg text-indigo-300">Estado de la plataforma</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 mt-4">
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Autenticación (Supabase)</span>
                                <span className="font-medium text-emerald-400">Correcto</span>
                            </li>
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Pagos (Stripe)</span>
                                <span className="font-medium text-emerald-400">Conectado (Live)</span>
                            </li>
                            <li className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Servidor (Render)</span>
                                <span className="font-medium text-emerald-400">En línea</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <Key className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-lg text-indigo-300">Permisos de Administrador</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-400 mb-4">
                            Reglas de acceso administrativo y configuración de correos oficiales.
                        </p>
                        <Button variant="outline" className="w-full border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white bg-[#1a103c]/40 text-indigo-300">Gestionar Roles</Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                        <History className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-lg text-indigo-300">Audit Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-[#0f0920]/50 border border-indigo-500/30 rounded-lg p-6 text-center text-slate-400 space-y-4">
                            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto opacity-70" />
                            <p>El registro detallado de eventos y métricas de seguridad requerirá la implementación de "pg_audit" en Supabase.</p>
                            <Button disabled className="bg-slate-800 text-slate-500 border-slate-700">Activar Logging</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
