"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Activity, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboardRoot() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text pb-1">
                        Panel de Administración
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        Bienvenido al centro de control maestro de CantoProject.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-purple-500/20 hover:border-pink-500/50 transition-all duration-300 shadow-lg shadow-purple-900/10 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200 group-hover:text-pink-300 transition-colors">Gestión de Proveedores</CardTitle>
                        <div className="p-2 bg-pink-500/10 rounded-full group-hover:bg-pink-500/20 transition-colors">
                            <Store className="h-5 w-5 text-pink-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-400 mb-6 min-h-[40px]">
                            Aprobar, rechazar o suspender cuentas de negocios y servicios.
                        </p>
                        <Link href="/dashboard/admin/providers">
                            <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-0 shadow-lg shadow-pink-600/20" size="sm">
                                Gestor <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 hover:border-indigo-400/50 transition-all duration-300 shadow-lg shadow-indigo-900/10 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">Usuarios Registrados</CardTitle>
                        <div className="p-2 bg-indigo-500/10 rounded-full group-hover:bg-indigo-500/20 transition-colors">
                            <Users className="h-5 w-5 text-indigo-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-400 mb-6 min-h-[40px]">
                            Administra las cuentas de clientes registrados en el ecosistema.
                        </p>
                        <Link href="/dashboard/admin/users">
                            <Button className="w-full bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 hover:text-white border border-indigo-500/30" size="sm">
                                Clientes <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300 shadow-lg shadow-emerald-900/10 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">Monitor de Actividad</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                            <Activity className="h-5 w-5 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-400 mb-6 min-h-[40px]">
                            Métricas globales de reservas, alcance y ganancias generadas.
                        </p>
                        <Link href="/dashboard/admin/activity">
                            <Button className="w-full bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 hover:text-emerald-100 border border-emerald-500/30" size="sm">
                                Analíticas <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 shadow-lg shadow-amber-900/10 group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200 group-hover:text-amber-300 transition-colors">Central de Seguridad</CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-full group-hover:bg-amber-500/20 transition-colors">
                            <ShieldCheck className="h-5 w-5 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-400 mb-6 min-h-[40px]">
                            Auditoría de logs, bloqueos y registros de autenticación del sistema.
                        </p>
                        <Link href="/dashboard/admin/security">
                            <Button className="w-full bg-amber-600/20 text-amber-300 hover:bg-amber-600/40 hover:text-amber-100 border border-amber-500/30" size="sm">
                                Seguridad <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
