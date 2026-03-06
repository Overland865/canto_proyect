"use client"

import Link from "next/link"
import { Plus, ShieldAlert } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SummaryTab } from "@/components/dashboard/provider/summary-tab"
import { BookingsTab } from "@/components/dashboard/provider/bookings-tab"
import { ServicesTab } from "@/components/dashboard/provider/services-tab"
import { ProfileTab } from "@/components/dashboard/provider/profile-tab"
import { AvailabilityCalendar } from "@/components/dashboard/provider/availability-calendar"
import { useProvider } from "@/context/provider-context"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { subDays, isSameDay, format } from "date-fns"
import { es } from "date-fns/locale"
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

    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const income = bookings.reduce((sum, booking) => {
        if (booking.status === 'confirmed' || booking.status === 'completed') {
            return sum + (booking.amount || 0)
        }
        return sum
    }, 0)

    const chartData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        const dayIncome = bookings.reduce((sum, b) => {
            if ((b.status === 'confirmed' || b.status === 'completed') && b.date) {
                const bDate = new Date(b.date)
                if (isSameDay(bDate, date)) return sum + (b.amount || 0)
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
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-white/50 font-inter">Acceso denegado. Este panel es solo para proveedores.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 container py-6">

            {/* ── Header ────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="ls-title text-3xl tracking-tight">Panel de Proveedor</h2>
                    <p className="text-white/50 font-inter text-sm mt-1">
                        Bienvenido, {user.businessName || user.name}
                    </p>
                </div>
                <Link href="/dashboard/provider/services/new">
                    <button className="ls-btn-cta">
                        <Plus className="h-4 w-4" />
                        Publicar Servicio
                    </button>
                </Link>
            </div>

            {/* ── Verification alert ────────────────────────── */}
            <div
                className="flex items-start gap-4 rounded-2xl p-4 border"
                style={{
                    background: "rgba(152,255,0,0.06)",
                    borderColor: "rgba(152,255,0,0.25)",
                }}
            >
                <span
                    className="mt-0.5 flex-shrink-0 rounded-full p-2"
                    style={{ background: "rgba(152,255,0,0.12)" }}
                >
                    <ShieldAlert className="h-4 w-4" style={{ color: "#98FF00" }} />
                </span>
                <div>
                    <p className="font-outfit font-bold text-sm" style={{ color: "#98FF00" }}>
                        Verificación Pendiente
                    </p>
                    <p className="text-white/60 font-inter text-sm mt-0.5">
                        Para publicar tus servicios, necesitas completar la verificación de identidad.{" "}
                        <button
                            className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-80"
                            style={{ color: "#98FF00" }}
                        >
                            Subir documentos
                        </button>
                    </p>
                </div>
            </div>

            {/* ── Tabs ──────────────────────────────────────── */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList
                    className="w-full md:w-auto h-auto grid grid-cols-2 md:grid-cols-3 lg:inline-flex flex-wrap gap-1 p-1.5 rounded-2xl border"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(255,255,255,0.08)",
                    }}
                >
                    {[
                        { value: "overview", label: "Resumen" },
                        { value: "bookings", label: "Reservas" },
                        { value: "services", label: "Mis Servicios" },
                        { value: "availability", label: "Disponibilidad" },
                        { value: "profile", label: "Perfil" },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="rounded-xl px-5 py-2 text-sm font-outfit font-semibold text-white/50 transition-all duration-200
                                data-[state=active]:text-white data-[state=active]:shadow-md"
                            style={{
                                // Active state via CSS custom property injection via inline var isn't possible in Tailwind,
                                // so we use a data-attribute selector defined below via a <style> tag approach, handled by the CSS class.
                            }}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
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
                    <BookingsTab bookings={bookings} updateStatus={updateBookingStatus} />
                </TabsContent>

                <TabsContent value="services">
                    <ServicesTab services={myServices} onDelete={deleteService} />
                </TabsContent>

                <TabsContent value="availability">
                    <AvailabilityCalendar />
                </TabsContent>

                <TabsContent value="profile">
                    <ProfileTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
