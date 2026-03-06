"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Activity as ActivityIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminActivityPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/admin">
                    <Button variant="outline" size="icon" className="border-purple-500/30 hover:bg-purple-500/20 hover:text-white bg-[#1a103c]/50 text-slate-300">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text pb-1">Monitor de Actividad</h2>
                    <p className="text-slate-400">Métricas generales de la plataforma y reportes.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10 hover:bg-[#1a103f]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-300">Reservas Activas</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">128</div>
                        <p className="text-xs text-slate-400">+14% respecto al mes anterior</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10 hover:bg-[#1a103f]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-300">Volumen Transaccional</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">$124,500 MXN</div>
                        <p className="text-xs text-slate-400">+5.6% respecto al mes anterior</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10 hover:bg-[#1a103f]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-300">Proveedores Activos</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">45</div>
                        <p className="text-xs text-slate-400">12 nuevos este mes</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10 hover:bg-[#1a103f]/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-300">Tasa de Conversión</CardTitle>
                        <ActivityIcon className="h-4 w-4 text-pink-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">4.2%</div>
                        <p className="text-xs text-slate-400">+1.2% respecto a la semana anterior</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="min-h-[400px] flex items-center justify-center border-dashed border-2 border-indigo-500/30 bg-[#0f0920]/50 rounded-xl">
                <div className="text-center">
                    <ActivityIcon className="w-16 h-16 text-indigo-500 opacity-50 mx-auto mb-4" />
                    <p className="text-xl font-medium text-indigo-300">Gráfico de Crecimiento</p>
                    <p className="text-slate-400 mt-2">Esta sección será integrada con datos de gráficos pronto.</p>
                </div>
            </Card>
        </div>
    )
}
