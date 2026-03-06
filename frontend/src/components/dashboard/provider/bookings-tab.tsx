"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { CalendarDays, Clock, Eye, Check, X, FileText, User, Briefcase, Landmark } from "lucide-react"
import { Booking } from "@/context/provider-context"
import { approveCancellation, rejectCancellation } from "@/lib/supabase-service"
import { createClient } from "@/lib/supabase/client"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"

interface BookingsTabProps {
    bookings: Booking[]
    updateStatus: (id: string, status: Booking["status"], proposedDate?: Date) => void
}

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
    confirmed: {
        label: "Confirmada",
        bg: "rgba(0,201,255,0.12)",
        color: "#00C9FF",
        border: "rgba(0,201,255,0.30)",
    },
    pending: {
        label: "Pendiente",
        bg: "rgba(255,184,0,0.12)",
        color: "#FFB800",
        border: "rgba(255,184,0,0.30)",
    },
    cancellation_requested: {
        label: "⚠ Cancelación",
        bg: "rgba(249,115,22,0.12)",
        color: "#fb923c",
        border: "rgba(249,115,22,0.30)",
    },
    cancelled: {
        label: "Cancelada",
        bg: "rgba(239,68,68,0.12)",
        color: "#f87171",
        border: "rgba(239,68,68,0.25)",
    },
    rejected: {
        label: "Rechazada",
        bg: "rgba(239,68,68,0.10)",
        color: "#f87171",
        border: "rgba(239,68,68,0.20)",
    },
    completed: {
        label: "Completada",
        bg: "rgba(152,255,0,0.10)",
        color: "#98FF00",
        border: "rgba(152,255,0,0.25)",
    },
    rescheduled: {
        label: "Reprogramada",
        bg: "rgba(152,255,0,0.08)",
        color: "#98FF00",
        border: "rgba(152,255,0,0.20)",
    },
    finalizado: {
        label: "Finalizado",
        bg: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.50)",
        border: "rgba(255,255,255,0.10)",
    },
}

function StatusPill({ status, date }: { status: string; date: string }) {
    const isEventPassed = () => {
        const eventDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate < today
    }

    const key = status === "confirmed" && isEventPassed() ? "finalizado" : status
    const cfg = statusConfig[key] ?? statusConfig["pending"]

    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-outfit font-bold uppercase tracking-wider border"
            style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
        >
            {cfg.label}
        </span>
    )
}

// Para la barra a la izquierda de cada tarjeta en el listado
function getStatusAccent(status: string, date: string) {
    const isEventPassed = () => {
        const eventDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        eventDate.setHours(0, 0, 0, 0)
        return eventDate < today
    }
    const key = status === "confirmed" && isEventPassed() ? "finalizado" : status
    return statusConfig[key]?.color ?? statusConfig["pending"].color
}

export function BookingsTab({ bookings, updateStatus }: BookingsTabProps) {
    const supabase = createClient()
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isRescheduling, setIsRescheduling] = useState(false)
    const [proposedDate, setProposedDate] = useState<Date | undefined>(undefined)

    const handleApproveCancellation = async (bookingId: string) => {
        try {
            await approveCancellation(supabase, bookingId)
            updateStatus(bookingId, 'cancelled')
        } catch (error) {
            console.error("Error approving cancellation:", error)
        }
    }

    const handleRejectCancellation = async (bookingId: string) => {
        try {
            await rejectCancellation(supabase, bookingId)
            updateStatus(bookingId, 'confirmed')
        } catch (error) {
            console.error("Error rejecting cancellation:", error)
        }
    }

    const openDetails = (booking: Booking) => {
        setSelectedBooking(booking)
        setIsDetailsOpen(true)
        setIsRescheduling(false)
        setProposedDate(undefined)
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            <div className="ls-glass flex flex-col min-h-[480px]">
                {/* ── Header ─────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div>
                        <h3 className="ls-title text-base mb-0.5">Solicitudes de Reserva</h3>
                        <p className="text-white/40 font-inter text-sm flex items-center gap-2">
                            {pendingCount} {pendingCount === 1 ? "solicitud pendiente" : "solicitudes pendientes"}
                            {pendingCount > 0 && (
                                <span className="flex h-2 w-2 rounded-full relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* ── Cards List ─────────────────────────────────── */}
                <div className="flex-1 p-5">
                    {bookings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <CalendarDays className="w-9 h-9" style={{ color: "rgba(255,255,255,0.20)" }} />
                            </div>
                            <div>
                                <h4 className="font-outfit font-bold text-white/60 text-base">Sin reservas</h4>
                                <p className="text-sm font-inter text-white/30 mt-1 max-w-[220px]">
                                    Aún no tienes solicitudes ni historial de reservas.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {bookings.map((booking) => {
                                const accent = getStatusAccent(booking.status, booking.date)
                                return (
                                    <div
                                        key={booking.id}
                                        className="group relative overflow-hidden rounded-2xl p-5 hover:scale-[1.01] transition-transform duration-200 flex flex-col justify-between"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)"
                                        }}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl opacity-80" style={{ background: accent }} />

                                        <div className="space-y-4 mb-5">
                                            {/* Service Name & Event */}
                                            <div className="flex items-start gap-3 pl-2">
                                                <div className="p-2.5 rounded-xl border flex-shrink-0" style={{ background: "var(--ls-bg)", borderColor: "rgba(255,255,255,0.10)" }}>
                                                    <Briefcase className="w-4 h-4" style={{ color: accent }} />
                                                </div>
                                                <div>
                                                    <h4 className="font-outfit font-bold text-white text-[15px] leading-tight mb-1">
                                                        {booking.serviceName}
                                                    </h4>
                                                    {booking.eventName && (
                                                        <span className="font-inter text-xs text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/5 inline-block mb-1 line-clamp-1">
                                                            {booking.eventName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Client & Date & Guests */}
                                            <div className="space-y-2 pl-2">
                                                <div className="flex items-center gap-2 text-white/50 text-sm font-inter">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span className="truncate">{booking.clientName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/50 text-sm font-inter">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    <span>{booking.date}, {booking.time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom row: Status, Price & Actions */}
                                        <div className="flex items-center justify-between border-t border-white/5 pt-4 pl-2">
                                            <div className="flex flex-col gap-1 items-start">
                                                <StatusPill status={booking.status} date={booking.date} />
                                                <span className="ls-price text-xl tracking-tight">${booking.amount}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openDetails(booking)}
                                                    className="ls-btn-ghost !px-3 !py-2 !rounded-lg"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                {booking.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'confirmed')}
                                                            className="flex items-center justify-center rounded-lg w-9 h-9 border transition-colors hover:scale-105"
                                                            style={{ background: "rgba(152,255,0,0.15)", borderColor: "rgba(152,255,0,0.4)", color: "#98FF00" }}
                                                            title="Confirmar"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'rejected')}
                                                            className="flex items-center justify-center rounded-lg w-9 h-9 border transition-colors hover:scale-105"
                                                            style={{ background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.4)", color: "#f87171" }}
                                                            title="Rechazar"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>


            {/* ── Detail dialog ─────────────────────────── */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent
                    className="max-w-md p-0 overflow-hidden rounded-3xl border-0 shadow-2xl"
                    style={{ background: "#111418" }}
                >
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
                                ID: {selectedBooking?.id}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {selectedBooking && (
                        <div className="p-7 space-y-6">
                            {/* Service */}
                            <div className="space-y-3">
                                <Row label="Servicio" value={selectedBooking.serviceName} />
                                {selectedBooking.eventName && (
                                    <Row label="Evento" value={selectedBooking.eventName} color="#00C9FF" />
                                )}
                                <div className="flex justify-between items-center pb-1">
                                    <span className="text-[11px] font-outfit font-bold uppercase tracking-wider text-white/35">Estado</span>
                                    <StatusPill status={selectedBooking.status} date={selectedBooking.date} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-outfit font-bold uppercase tracking-wider text-white/35">Total a pagar</span>
                                    <span className="ls-price text-2xl">${selectedBooking.amount}</span>
                                </div>
                            </div>

                            <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />

                            {/* Client & Logistics */}
                            <div className="space-y-3">
                                <IconRow icon={<User className="w-4 h-4" />} label="Cliente" value={selectedBooking.clientName} />
                                <IconRow icon={<FileText className="w-4 h-4" />} label="Teléfono" value={selectedBooking.clientPhone || 'No especificado'} />
                                <IconRow icon={<Clock className="w-4 h-4" />} label="Fecha" value={`${selectedBooking.date}, ${selectedBooking.time}`} />
                                <IconRow icon={<User className="w-4 h-4" />} label="Invitados" value={`${selectedBooking.guests} personas`} />
                                <IconRow icon={<Landmark className="w-4 h-4" />} label="Ubicación" value={selectedBooking.location || 'No especificada'} />
                            </div>

                            {selectedBooking.specifications && (
                                <>
                                    <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                                    <div>
                                        <p className="text-[11px] font-outfit font-bold uppercase tracking-wider text-white/35 mb-2">Especificaciones</p>
                                        <div className="rounded-xl p-3 text-sm font-inter text-white/70" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                            {selectedBooking.specifications}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Actions */}
                            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-white/10 mt-6">
                                {selectedBooking?.status === 'cancellation_requested' && (
                                    <>
                                        <button className="ls-btn-ghost flex-1 justify-center" onClick={() => { handleRejectCancellation(selectedBooking.id); setIsDetailsOpen(false) }}>
                                            Rechazar
                                        </button>
                                        <button className="ls-btn-danger flex-1 justify-center" onClick={() => { handleApproveCancellation(selectedBooking.id); setIsDetailsOpen(false) }}>
                                            Aprobar Cancelación
                                        </button>
                                    </>
                                )}

                                {selectedBooking?.status === 'pending' && !isRescheduling && (
                                    <>
                                        <button className="ls-btn-ghost flex-1 justify-center" onClick={() => setIsRescheduling(true)}>
                                            Reprogramar
                                        </button>
                                        <button className="ls-btn-danger flex-1 justify-center" onClick={() => { updateStatus(selectedBooking.id, 'rejected'); setIsDetailsOpen(false) }}>
                                            Rechazar
                                        </button>
                                        <button className="ls-btn-cta flex-1 justify-center" onClick={() => { updateStatus(selectedBooking.id, 'confirmed'); setIsDetailsOpen(false) }}>
                                            Aprobar
                                        </button>
                                    </>
                                )}

                                {isRescheduling && (
                                    <div className="w-full flex justify-center flex-col gap-4">
                                        <div className="p-4 bg-black/20 rounded-2xl mx-auto border border-white/5">
                                            <Calendar
                                                mode="single"
                                                locale={es}
                                                selected={proposedDate}
                                                onSelect={setProposedDate}
                                                className="bg-transparent text-white w-full max-w-[420px] mx-auto p-2 sm:p-4 auto [&_[data-selected-single=true]]:!bg-ls-blue [&_[data-selected-single=true]]:!text-white [&_[data-selected-single=true]]:font-bold [&_[data-selected-single=true]]:shadow-md [&_[data-selected-single=true]]:shadow-ls-blue/20 [&_button]:rounded-full [&_button:hover:not([data-selected-single=true])]:bg-white/10"
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
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2 w-full">
                                            <button className="ls-btn-ghost flex-1 justify-center" onClick={() => setIsRescheduling(false)}>Volver</button>
                                            <button className="ls-btn-cta flex-1 justify-center" onClick={() => { if (proposedDate) { updateStatus(selectedBooking.id, 'rescheduled', proposedDate); setIsDetailsOpen(false) } }}>
                                                Enviar Reprogramación
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Cerrar default for non-pending */}
                                {selectedBooking?.status !== 'pending' && selectedBooking?.status !== 'cancellation_requested' && (
                                    <button
                                        onClick={() => setIsDetailsOpen(false)}
                                        className="ls-btn-cta w-full justify-center"
                                    >
                                        Cerrar
                                    </button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function Row({ label, value, color }: { label: string; value: string, color?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[11px] font-outfit font-bold uppercase tracking-wider text-white/35 flex-shrink-0">{label}</span>
            <span className="font-inter font-semibold text-right max-w-[200px] leading-snug line-clamp-2" style={{ color: color || "rgba(255,255,255,0.85)" }}>{value}</span>
        </div>
    )
}

function IconRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white/35 flex-shrink-0">
                {icon}
                <span className="text-[11px] font-outfit font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span className="font-inter font-semibold text-white/70 text-right max-w-[170px] leading-snug truncate">{value}</span>
        </div>
    )
}
