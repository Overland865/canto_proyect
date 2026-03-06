"use client"

import { Switch } from "@/components/ui/switch"
import { useProvider } from "@/context/provider-context"
import { toast } from "sonner"
import Link from "next/link"
import { LayoutGrid, Pencil, Trash2, Package } from "lucide-react"

interface ServicesTabProps {
    services: any[]
    onDelete: (id: string) => void
}

export function ServicesTab({ services, onDelete }: ServicesTabProps) {
    const { toggleServiceStatus } = useProvider()

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleServiceStatus(id, !currentStatus)
            toast.success(`Servicio ${!currentStatus ? 'activado' : 'pausado'} exitosamente`)
        } catch {
            toast.error("Error al cambiar el estado del servicio")
        }
    }

    if (services.length === 0) {
        return (
            <div
                className="flex flex-col items-center justify-center py-24 rounded-2xl border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", borderStyle: "dashed" }}
            >
                <span
                    className="rounded-2xl p-4 mb-4"
                    style={{ background: "rgba(0,82,212,0.12)" }}
                >
                    <Package className="h-8 w-8" style={{ color: "#0052D4" }} />
                </span>
                <h3 className="ls-title text-base mb-1">No tienes servicios publicados</h3>
                <p className="text-white/40 font-inter text-sm mb-5">
                    Crea tu primer servicio o paquete para empezar a vender.
                </p>
                <Link href="/dashboard/provider/services/new">
                    <button className="ls-btn-cta">Crear Servicio</button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="ls-title text-base">Mis Servicios ({services.length})</h3>
                <Link href="/dashboard/provider/services/new">
                    <button className="ls-btn-cta !py-2 !px-4 text-xs">+ Nuevo</button>
                </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className={`ls-glass flex flex-col transition-all duration-300 ${!service.is_active ? 'opacity-60' : ''}`}
                    >
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                            {service.image ? (
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ background: "#1A1F25" }}
                                >
                                    <LayoutGrid className="h-10 w-10" style={{ color: "rgba(255,255,255,0.15)" }} />
                                </div>
                            )}

                            {/* Type badge */}
                            <span
                                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-outfit font-bold border"
                                style={{
                                    background: service.type === 'package'
                                        ? "rgba(0,82,212,0.80)"
                                        : "rgba(255,184,0,0.80)",
                                    borderColor: "rgba(255,255,255,0.20)",
                                    color: "#fff",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                {service.type === 'package' ? 'Paquete' : 'Servicio'}
                            </span>

                            {/* Paused overlay */}
                            {!service.is_active && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ background: "rgba(15,18,22,0.60)", backdropFilter: "blur(2px)" }}
                                >
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-outfit font-bold border"
                                        style={{
                                            background: "rgba(255,255,255,0.10)",
                                            borderColor: "rgba(255,255,255,0.25)",
                                            color: "rgba(255,255,255,0.70)",
                                        }}
                                    >
                                        No Disponible
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex flex-col flex-1 p-4 gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="ls-title text-sm line-clamp-1">{service.title}</h4>
                                    <p className="text-white/40 font-inter text-xs line-clamp-2 mt-0.5">
                                        {service.description}
                                    </p>
                                </div>
                                {/* Toggle */}
                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                    <Switch
                                        checked={service.is_active ?? true}
                                        onCheckedChange={() => handleToggle(service.id, service.is_active ?? true)}
                                    />
                                    <span className="text-[10px] font-outfit uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                                        {service.is_active ? 'Activo' : 'Pausa'}
                                    </span>
                                </div>
                            </div>

                            <p className="ls-price text-xl">${service.price.toLocaleString()}</p>

                            <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                                <Link href={`/dashboard/provider/services/${service.id}`} className="flex-1">
                                    <button
                                        className="w-full ls-btn-ghost !py-2 !rounded-lg text-xs"
                                        disabled={!service.is_active}
                                    >
                                        <Pencil className="h-3.5 w-3.5" /> Editar
                                    </button>
                                </Link>
                                <button
                                    className="ls-btn-danger !py-2 !px-3 !rounded-lg text-xs"
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de eliminar este servicio?')) {
                                            onDelete(service.id)
                                        }
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
