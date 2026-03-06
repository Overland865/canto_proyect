"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { useProvider, type Booking } from "@/context/provider-context"
import { toast } from "sonner"
import { format, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { getProviderBlockedDates, toggleProviderBlockedDate } from "@/lib/supabase-service"
import { Clock, User, Briefcase, Activity, Landmark, Users, X, Lock, Unlock } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string }> = {
    confirmed_past: { label: "Finalizado", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.15)", text: "rgba(255,255,255,0.55)" },
    confirmed: { label: "Confirmado", bg: "rgba(0,201,255,0.12)", border: "rgba(0,201,255,0.35)", text: "#00C9FF" },
    pending: { label: "Pendiente", bg: "rgba(255,184,0,0.12)", border: "rgba(255,184,0,0.35)", text: "#FFB800" },
    cancelled: { label: "Cancelada", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.30)", text: "#f87171" },
}

function getStatusKey(booking: Booking, isEventPassed: (d: string) => boolean) {
    if (booking.status === "confirmed" && isEventPassed(booking.date)) return "confirmed_past"
    return booking.status as keyof typeof STATUS_CONFIG
}

function StatusPill({ statusKey }: { statusKey: string }) {
    const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.pending
    return (
        <span
            className="px-2.5 py-1 rounded-full text-[10px] font-outfit font-bold uppercase tracking-wider"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
        >
            {cfg.label}
        </span>
    )
}

export function AvailabilityCalendar() {
    const { user } = useAuth()
    const { bookings } = useProvider()
    const [blockedDates, setBlockedDates] = useState<Date[]>([])
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [calendarKey, setCalendarKey] = useState(0)

    const supabase = useMemo(() => createClient(), [])

    // Init selected date client-side (avoids hydration mismatch)
    useEffect(() => {
        if (!selectedDate) setSelectedDate(new Date())
    }, [])

    // Auto-dismiss stuck loading
    useEffect(() => {
        if (loading) {
            const t = setTimeout(() => {
                setLoading(false)
                toast.error("La operación tomó demasiado tiempo. Intenta nuevamente.")
            }, 8000)
            return () => clearTimeout(t)
        }
    }, [loading])

    const isEventPassed = (dateStr: string): boolean => {
        if (!dateStr) return false
        let d: Date
        if (dateStr.includes('-')) {
            const [y, m, day] = dateStr.split('-')
            d = new Date(+y, +m - 1, +day)
        } else if (dateStr.includes('/')) {
            const [day, m, y] = dateStr.split('/')
            d = new Date(+y, +m - 1, +day)
        } else {
            d = new Date(dateStr)
        }
        const today = new Date(); today.setHours(0, 0, 0, 0)
        d.setHours(0, 0, 0, 0)
        return d < today
    }

    const fetchBlockedDates = async () => {
        if (!user?.id) return
        try {
            const blocked = await getProviderBlockedDates(supabase, user.id)
            setBlockedDates(blocked)
        } catch (e) { console.error("Error fetching blocked dates:", e) }
    }

    useEffect(() => {
        if (user?.id) fetchBlockedDates()
    }, [user?.id])

    const bookedDates = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'pending')
        .map(b => parseISO(b.date))

    const bookingsForSelectedDate = selectedDate
        ? bookings.filter(b => isSameDay(parseISO(b.date), selectedDate))
        : []

    const isPastDay = (day: Date): boolean => {
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const d = new Date(day); d.setHours(0, 0, 0, 0)
        return d < today
    }

    const isDayClickable = (day: Date): boolean => {
        if (!isPastDay(day)) return true
        const dateStr = format(day, "yyyy-MM-dd")
        return bookings.some(b => b.date === dateStr && (b.status === 'confirmed' || b.status === 'pending'))
    }

    const handleDayClick = async (day: Date) => {
        if (!user) return
        if (!isDayClickable(day)) { toast.error("No puedes seleccionar este día"); return }

        const dateStr = format(day, "yyyy-MM-dd")
        const isBooked = bookings.some(b => b.date === dateStr && (b.status === 'confirmed' || b.status === 'pending'))

        if (isPastDay(day)) { setSelectedDate(day); return }

        const today = new Date(); today.setHours(0, 0, 0, 0)
        const checkDay = new Date(day); checkDay.setHours(0, 0, 0, 0)
        if (isSameDay(checkDay, today)) { setSelectedDate(day); toast.error("No puedes bloquear el día actual"); return }
        if (isBooked) { setSelectedDate(day); toast.info("Este día tiene reservas, no se puede bloquear"); return }

        setSelectedDate(day)
        setLoading(true)
        try {
            const nowBlocked = await toggleProviderBlockedDate(supabase, user.id, dateStr)
            const updated = await getProviderBlockedDates(supabase, user.id)
            setBlockedDates(updated)
            setCalendarKey(prev => prev + 1)
            nowBlocked
                ? toast.success("📍 Día bloqueado – No aceptarás reservas en esta fecha", { duration: 3000 })
                : toast.success("🔓 Día desbloqueado – Vuelves a estar disponible", { duration: 3000 })
        } catch (e: any) {
            console.error("Error updating blocked date:", e)
            toast.error("Error al actualizar disponibilidad")
            await fetchBlockedDates()
        } finally {
            setLoading(false)
        }
    }

    // Is the selected date blocked?
    const isSelectedBlocked = selectedDate && blockedDates.some(d => isSameDay(d, selectedDate))

    return (
        <div className="grid lg:grid-cols-5 gap-6 items-start">

            {/* ── Left: Calendar Card ───────────────────────────── */}
            <div className="lg:col-span-2 ls-glass flex flex-col">
                {/* Header */}
                <div
                    className="flex justify-between items-center p-5 pb-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                    <h3 className="ls-title text-base">Calendario</h3>
                    <div className="flex gap-4 text-[10px] items-center">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(239,68,68,0.40)", border: "1px solid rgba(239,68,68,0.50)" }} />
                            <span className="font-outfit uppercase tracking-wider text-white/40">Bloqueado</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(0,201,255,0.30)", border: "1px solid rgba(0,201,255,0.50)" }} />
                            <span className="font-outfit uppercase tracking-wider text-white/40">Reservado</span>
                        </div>
                    </div>
                </div>

                {/* Calendar body */}
                <div className="flex flex-1 items-center justify-center p-4" suppressHydrationWarning>
                    {selectedDate && (
                        <Calendar
                            key={calendarKey}
                            mode="single"
                            locale={es}
                            selected={selectedDate}
                            onSelect={(d) => d && handleDayClick(d)}
                            modifiers={{ blocked: blockedDates, booked: bookedDates }}
                            modifiersStyles={{
                                blocked: { backgroundColor: 'rgba(239,68,68,0.35)', color: '#fee2e2', fontWeight: 'bold' },
                                booked: { backgroundColor: 'rgba(0,201,255,0.30)', color: '#cffafe', fontWeight: 'bold' },
                            }}
                            disabled={(day) => !isDayClickable(day)}
                            className="bg-transparent text-white w-full max-w-[420px] mx-auto p-2 sm:p-4 [&_[data-selected-single=true]]:!bg-ls-blue [&_[data-selected-single=true]]:!text-white [&_[data-selected-single=true]]:font-bold [&_[data-selected-single=true]]:shadow-md [&_[data-selected-single=true]]:shadow-ls-blue/20 [&_button]:rounded-full [&_button:hover:not([data-selected-single=true])]:bg-white/10"
                            classNames={{
                                caption_label: "text-lg font-outfit font-bold text-white capitalize",
                                button_previous: "h-8 w-8 bg-transparent p-0 text-white/50 hover:text-white transition-colors absolute left-2",
                                button_next: "h-8 w-8 bg-transparent p-0 text-white/50 hover:text-white transition-colors absolute right-2",
                                weekday: "text-white/40 font-outfit text-sm font-semibold capitalize flex-1 text-center font-normal",
                                today: "border border-white/20 text-white font-bold rounded-full",
                                outside: "text-white/20 opacity-50",
                                disabled: "text-white/20 opacity-30 cursor-not-allowed",
                            }}
                        />
                    )}
                </div>

                {/* Footer hint */}
                <div
                    className="p-4 border-t text-center"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                    <p className="text-white/30 font-inter text-xs italic">
                        Selecciona cualquier día para ver sus reservas. Solo puedes bloquear días futuros.
                    </p>
                </div>
            </div>

            {/* ── Right: Day Detail Card ────────────────────────── */}
            <div className="lg:col-span-3 ls-glass min-h-[480px] flex flex-col">
                {/* Header */}
                <div
                    className="flex justify-between items-start gap-4 p-5 pb-4 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                    <div className="flex-1">
                        <h3 className="ls-title text-base capitalize">
                            {selectedDate
                                ? format(selectedDate, "PPPP", { locale: es })
                                : "Seleccione una fecha"}
                        </h3>
                        <p
                            className="text-sm font-inter mt-0.5"
                            style={{ color: bookingsForSelectedDate.length > 0 ? "#00C9FF" : "rgba(255,255,255,0.35)" }}
                        >
                            {bookingsForSelectedDate.length}{" "}
                            {bookingsForSelectedDate.length === 1 ? "reserva registrada" : "reservas registradas"}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {selectedDate && (
                            <>
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-outfit font-semibold"
                                    style={{
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        color: "rgba(255,255,255,0.60)",
                                    }}
                                >
                                    {format(selectedDate, "dd/MM/yyyy")}
                                </span>
                                {!isPastDay(selectedDate) && (
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-outfit font-bold"
                                        style={
                                            isSelectedBlocked
                                                ? { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }
                                                : { background: "rgba(0,201,255,0.12)", border: "1px solid rgba(0,201,255,0.35)", color: "#00C9FF" }
                                        }
                                    >
                                        {isSelectedBlocked ? "🔴 Bloqueado" : "🟢 Disponible"}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Bookings list */}
                <div className="flex-1 p-5">
                    {bookingsForSelectedDate.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                <Clock className="w-9 h-9" style={{ color: "rgba(255,255,255,0.20)" }} />
                            </div>
                            <div>
                                <h4 className="font-outfit font-bold text-white/60 text-base">Día libre de reservas</h4>
                                <p className="text-sm font-inter text-white/30 mt-1 max-w-[220px]">
                                    No hay eventos programados en esta fecha seleccionada.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bookingsForSelectedDate.map((booking) => {
                                const sk = getStatusKey(booking, isEventPassed)
                                const cfg = STATUS_CONFIG[sk] ?? STATUS_CONFIG.pending
                                return (
                                    <div
                                        key={booking.id}
                                        onClick={() => setSelectedBooking(booking)}
                                        className="group cursor-pointer relative overflow-hidden p-5 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                    >
                                        {/* Accent left bar */}
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                                            style={{ background: cfg.text }}
                                        />
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="p-2 rounded-xl flex-shrink-0"
                                                        style={{ background: "rgba(255,184,0,0.12)", border: "1px solid rgba(255,184,0,0.20)" }}
                                                    >
                                                        <Briefcase className="w-4 h-4" style={{ color: "#FFB800" }} />
                                                    </span>
                                                    <h4 className="font-outfit font-bold text-white text-base leading-tight">
                                                        {booking.serviceName}
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap gap-x-5 gap-y-1.5 pl-11">
                                                    <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                                                        <User className="w-3.5 h-3.5" />
                                                        <span className="font-inter text-sm">{booking.clientName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="font-inter text-sm">{booking.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                                <StatusPill statusKey={sk} />
                                                <div className="text-right">
                                                    <span className="text-xs font-inter block" style={{ color: "rgba(255,255,255,0.35)" }}>Total</span>
                                                    <span className="ls-price text-xl">${booking.amount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="p-4 border-t flex justify-center"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                    <div className="flex items-center gap-2 text-[11px] font-outfit uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                        <Activity className="w-3 h-3" />
                        Centro de eventos
                    </div>
                </div>
            </div>

            {/* ── Booking Detail Dialog ─────────────────────────── */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent
                    className="max-w-md p-0 overflow-hidden rounded-3xl border-0 shadow-2xl"
                    style={{ background: "#111418" }}
                >
                    {/* Dialog Header */}
                    <div
                        className="p-7 pb-6 border-b"
                        style={{
                            background: "rgba(0,82,212,0.12)",
                            borderColor: "rgba(0,82,212,0.25)",
                        }}
                    >
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="ls-title text-2xl text-center">Detalle de Reserva</DialogTitle>
                            <DialogDescription className="text-center text-sm font-inter" style={{ color: "rgba(255,255,255,0.40)" }}>
                                Información del cliente y servicio
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedBooking && (() => {
                        const sk = getStatusKey(selectedBooking, isEventPassed)
                        const cfg = STATUS_CONFIG[sk] ?? STATUS_CONFIG.pending
                        return (
                            <div className="p-7 space-y-6">
                                {/* Client */}
                                <div className="space-y-3">
                                    <Row label="Cliente" value={selectedBooking.clientName} />
                                    <Row label="Teléfono" value={selectedBooking.clientPhone || 'No especificado'} />
                                </div>

                                <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

                                {/* Service */}
                                <div className="space-y-3">
                                    <Row label="Servicio" value={selectedBooking.serviceName} />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-outfit font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Precio</span>
                                        <span className="ls-price text-2xl">${selectedBooking.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-outfit font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>Estado</span>
                                        <StatusPill statusKey={sk} />
                                    </div>
                                </div>

                                <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

                                {/* Logistics */}
                                <div className="space-y-3">
                                    <IconRow icon={<Clock className="w-4 h-4" />} label="Fecha"
                                        value={`${format(parseISO(selectedBooking.date), "dd MMM yyyy", { locale: es })}, ${selectedBooking.time}`}
                                    />
                                    <IconRow icon={<Landmark className="w-4 h-4" />} label="Ubicación" value={selectedBooking.location || 'No especificada'} />
                                    <IconRow icon={<Users className="w-4 h-4" />} label="Invitados" value={`${selectedBooking.guests} personas`} />
                                </div>

                                {/* Close */}
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="ls-btn-cta w-full justify-center mt-2"
                                >
                                    Cerrar
                                </button>
                            </div>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    )
}

/* ── tiny helper components ─────────────────────────────────────────────────── */

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[11px] font-outfit font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
            <span className="font-inter font-semibold text-white/85 text-right max-w-[200px] leading-snug">{value}</span>
        </div>
    )
}

function IconRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                {icon}
                <span className="text-[11px] font-outfit font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span className="font-inter font-semibold text-white/70 text-right max-w-[180px] leading-snug">{value}</span>
        </div>
    )
}
