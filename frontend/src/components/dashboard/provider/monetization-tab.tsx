"use client"

import { useState } from "react"
import {
    Zap,
    Star,
    Crown,
    Check,
    ArrowRight,
    TrendingUp,
    Users,
    BarChart3,
    Headphones,
    Shield,
    Sparkles,
    BadgePercent,
    ChevronDown,
    ChevronUp,
} from "lucide-react"

/* ─── Plan data ──────────────────────────────────────────────────────── */
const plans = [
    {
        id: "basic",
        name: "Básico",
        price: "Gratis",
        period: null,
        description: "Para comenzar a ofrecer tus servicios en Local Space.",
        color: "rgba(255,255,255,0.08)",
        borderColor: "rgba(255,255,255,0.10)",
        glowColor: "transparent",
        icon: Zap,
        iconColor: "#60a5fa",
        badge: null,
        highlighted: false,
        commission: "15%",
        commissionLabel: "de comisión por reserva",
        cta: "Plan Actual",
        ctaDisabled: true,
        features: [
            "Hasta 2 servicios publicados",
            "Perfil de proveedor básico",
            "Acceso a solicitudes entrantes",
            "Soporte por email (48 h)",
            "Estadísticas básicas de visitas",
        ],
        notIncluded: [
            "Prioridad en resultados de búsqueda",
            "Analytics avanzados",
            "Insignia de Proveedor Verificado",
            "Gestor de cuenta dedicado",
        ],
    },
    {
        id: "pro",
        name: "Profesional",
        price: "$299",
        period: "/mes",
        description: "Para proveedores activos que quieren crecer rápido.",
        color: "rgba(0,82,212,0.12)",
        borderColor: "rgba(0,201,255,0.30)",
        glowColor: "rgba(0,82,212,0.25)",
        icon: Star,
        iconColor: "#00C9FF",
        badge: "Más Popular",
        highlighted: true,
        commission: "10%",
        commissionLabel: "de comisión por reserva",
        cta: "Activar Plan Pro",
        ctaDisabled: false,
        features: [
            "Hasta 10 servicios publicados",
            "Prioridad en resultados de búsqueda",
            "Analytics de rendimiento (30 días)",
            "Insignia de Proveedor Verificado",
            "Soporte prioritario (12 h)",
            "Acceso anticipado a nuevas funciones",
        ],
        notIncluded: [
            "Posición destacada en la home",
            "Gestor de cuenta dedicado",
        ],
    },
    {
        id: "premium",
        name: "Premium",
        price: "$799",
        period: "/mes",
        description: "Para negocios de alto volumen que dominan el mercado.",
        color: "rgba(152,255,0,0.06)",
        borderColor: "rgba(152,255,0,0.25)",
        glowColor: "rgba(152,255,0,0.15)",
        icon: Crown,
        iconColor: "#98FF00",
        badge: "Máximo Alcance",
        highlighted: false,
        commission: "7%",
        commissionLabel: "de comisión por reserva",
        cta: "Activar Premium",
        ctaDisabled: false,
        features: [
            "Servicios ilimitados",
            "Posición destacada en página principal",
            "Analytics avanzados en tiempo real",
            "Insignia Premium exclusiva",
            "Gestor de cuenta dedicado",
            "Soporte 24/7 por chat y teléfono",
            "Reportes mensuales personalizados",
            "Integración con calendarios externos",
        ],
        notIncluded: [],
    },
]

/* ─── Benefits ───────────────────────────────────────────────────────── */
const benefits = [
    {
        icon: TrendingUp,
        color: "#00C9FF",
        title: "Más visibilidad",
        desc: "Aparece primero en búsquedas y aumenta tus reservas hasta 3×.",
    },
    {
        icon: BadgePercent,
        color: "#98FF00",
        title: "Menor comisión",
        desc: "Paga menos por cada reserva confirmada y maximiza tus ganancias.",
    },
    {
        icon: BarChart3,
        color: "#a78bfa",
        title: "Analytics en tiempo real",
        desc: "Entiende qué servicios generan más ingresos y optimiza tu oferta.",
    },
    {
        icon: Headphones,
        color: "#f59e0b",
        title: "Soporte dedicado",
        desc: "Un gestor de cuenta que te acompaña y resuelve dudas en horas.",
    },
    {
        icon: Shield,
        color: "#34d399",
        title: "Insignia verificada",
        desc: "Genera confianza instantánea y aumenta tu tasa de conversión.",
    },
    {
        icon: Users,
        color: "#f472b6",
        title: "Más clientes",
        desc: "Accede a clientes corporativos y eventos de alto valor.",
    },
]

/* ─── FAQ ────────────────────────────────────────────────────────────── */
const faqs = [
    {
        q: "¿Puedo cambiar de plan en cualquier momento?",
        a: "Sí. Puedes actualizar o bajar tu plan en cualquier momento desde esta sección. Los cambios aplican al siguiente ciclo de facturación.",
    },
    {
        q: "¿Qué pasa con mis servicios si bajo al plan Básico?",
        a: "Tus servicios se conservan, pero solo 2 estarán activos y visibles para clientes. Los demás quedan archivados y puedes reactivarlos cuando actualices tu plan.",
    },
    {
        q: "¿Cómo funciona la comisión?",
        a: "La comisión se descuenta automáticamente del monto de cada reserva confirmada antes de transferirte los fondos. Cuanto mayor sea tu plan, menor es el porcentaje.",
    },
    {
        q: "¿Hay contratos de permanencia?",
        a: "No. Todos los planes son por mes sin compromiso. Cancela cuando quieras sin penalización.",
    },
]

/* ─── Component ──────────────────────────────────────────────────────── */
export function MonetizationTab() {
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const currentPlan = "basic" // TODO: obtener del contexto/BD del proveedor

    return (
        <div className="space-y-10 animate-in-fade">

            {/* ── Header ─────────────────────────────────────── */}
            <div className="ls-glass p-8 text-center relative overflow-hidden">
                {/* Background gradient */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 0%, rgba(0,82,212,0.18) 0%, transparent 70%)",
                    }}
                />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-outfit font-semibold mb-5"
                        style={{
                            background: "rgba(152,255,0,0.10)",
                            border: "1px solid rgba(152,255,0,0.25)",
                            color: "#98FF00",
                        }}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Estrategia de Monetización — Local Space
                    </div>
                    <h2 className="ls-title text-3xl md:text-4xl mb-3">
                        Crece con el plan correcto
                    </h2>
                    <p className="text-white/55 font-inter text-base max-w-xl mx-auto">
                        Elige el plan que mejor se adapte a tu negocio. Sin contratos, sin sorpresas.
                        Cancela cuando quieras.
                    </p>
                </div>
            </div>

            {/* ── Plans grid ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const Icon = plan.icon
                    const isCurrent = plan.id === currentPlan

                    return (
                        <div
                            key={plan.id}
                            className="relative flex flex-col rounded-2xl border transition-transform duration-300 hover:scale-[1.02]"
                            style={{
                                background: plan.color,
                                borderColor: plan.borderColor,
                                boxShadow: plan.glowColor !== "transparent"
                                    ? `0 0 40px ${plan.glowColor}, 0 10px 30px rgba(0,0,0,0.30)`
                                    : "0 10px 30px rgba(0,0,0,0.25)",
                            }}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                                    <span
                                        className="rounded-full px-3 py-1 text-xs font-outfit font-bold"
                                        style={{
                                            background:
                                                plan.id === "pro"
                                                    ? "linear-gradient(90deg,#0052D4,#00C9FF)"
                                                    : "linear-gradient(90deg,#4ade80,#98FF00)",
                                            color: plan.id === "pro" ? "#fff" : "#0F1216",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                                        }}
                                    >
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col gap-5">
                                {/* Icon + Name */}
                                <div className="flex items-center gap-3">
                                    <span
                                        className="rounded-xl p-2.5"
                                        style={{ background: `${plan.iconColor}18` }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: plan.iconColor }} />
                                    </span>
                                    <span className="ls-title text-lg">{plan.name}</span>
                                    {isCurrent && (
                                        <span
                                            className="ml-auto text-xs font-outfit font-semibold rounded-full px-2.5 py-0.5"
                                            style={{
                                                background: "rgba(255,255,255,0.10)",
                                                color: "rgba(255,255,255,0.60)",
                                            }}
                                        >
                                            Actual
                                        </span>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <div className="flex items-end gap-1">
                                        <span
                                            className="font-outfit font-bold text-4xl"
                                            style={{ color: plan.iconColor }}
                                        >
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className="text-white/40 font-inter text-sm mb-1">
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/50 font-inter text-sm mt-1">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Commission badge */}
                                <div
                                    className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                                    style={{
                                        background: `${plan.iconColor}12`,
                                        border: `1px solid ${plan.iconColor}25`,
                                    }}
                                >
                                    <BadgePercent className="w-4 h-4 shrink-0" style={{ color: plan.iconColor }} />
                                    <span className="font-outfit font-bold text-sm" style={{ color: plan.iconColor }}>
                                        {plan.commission}
                                    </span>
                                    <span className="text-white/50 font-inter text-xs">
                                        {plan.commissionLabel}
                                    </span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-sm font-inter text-white/80">
                                            <Check
                                                className="w-4 h-4 mt-0.5 shrink-0"
                                                style={{ color: plan.iconColor }}
                                            />
                                            {f}
                                        </li>
                                    ))}
                                    {plan.notIncluded.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-sm font-inter text-white/25 line-through">
                                            <span className="w-4 h-4 mt-0.5 shrink-0 text-white/20">✕</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    disabled={plan.ctaDisabled}
                                    className="w-full rounded-xl py-3 font-outfit font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                                    style={{
                                        background: plan.ctaDisabled
                                            ? "rgba(255,255,255,0.06)"
                                            : plan.id === "pro"
                                                ? "linear-gradient(90deg,#0052D4,#00C9FF)"
                                                : plan.id === "premium"
                                                    ? "linear-gradient(90deg,#4ade80,#98FF00)"
                                                    : "transparent",
                                        color: plan.ctaDisabled
                                            ? "rgba(255,255,255,0.30)"
                                            : plan.id === "premium"
                                                ? "#0F1216"
                                                : "#ffffff",
                                        cursor: plan.ctaDisabled ? "default" : "pointer",
                                        boxShadow: plan.ctaDisabled
                                            ? "none"
                                            : plan.id === "pro"
                                                ? "0 8px 20px rgba(0,82,212,0.40)"
                                                : plan.id === "premium"
                                                    ? "0 8px 20px rgba(152,255,0,0.30)"
                                                    : "none",
                                    }}
                                >
                                    {plan.cta}
                                    {!plan.ctaDisabled && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Benefits ───────────────────────────────────── */}
            <div>
                <h3 className="ls-title text-xl mb-5">¿Por qué actualizar tu plan?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {benefits.map((b) => {
                        const Icon = b.icon
                        return (
                            <div
                                key={b.title}
                                className="ls-surface p-5 rounded-2xl flex items-start gap-4 transition-all duration-200 hover:border-white/15"
                            >
                                <span
                                    className="rounded-xl p-2.5 shrink-0"
                                    style={{ background: `${b.color}18` }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: b.color }} />
                                </span>
                                <div>
                                    <p className="font-outfit font-semibold text-white text-sm mb-1">{b.title}</p>
                                    <p className="text-white/50 font-inter text-xs leading-relaxed">{b.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Comparison table ───────────────────────────── */}
            <div className="ls-glass p-6 overflow-x-auto">
                <h3 className="ls-title text-xl mb-6">Comparación de planes</h3>
                <table className="w-full text-sm font-inter min-w-[500px]">
                    <thead>
                        <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <th className="text-left text-white/40 font-inter font-medium pb-4 w-1/2">Característica</th>
                            <th className="text-center text-white/40 font-inter font-medium pb-4">Básico</th>
                            <th className="text-center pb-4" style={{ color: "#00C9FF" }}>
                                <span className="font-outfit font-bold">Pro</span>
                            </th>
                            <th className="text-center pb-4" style={{ color: "#98FF00" }}>
                                <span className="font-outfit font-bold">Premium</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ["Servicios publicados", "2", "10", "Ilimitados"],
                            ["Comisión por reserva", "15%", "10%", "7%"],
                            ["Prioridad en búsqueda", false, true, true],
                            ["Analytics avanzados", false, true, true],
                            ["Insignia verificada", false, true, true],
                            ["Posición en la home", false, false, true],
                            ["Gestor dedicado", false, false, true],
                            ["Soporte 24/7", false, false, true],
                        ].map(([feat, basic, pro, premium], i) => (
                            <tr
                                key={String(feat)}
                                className="border-b"
                                style={{ borderColor: "rgba(255,255,255,0.05)" }}
                            >
                                <td className="py-3.5 text-white/70 font-inter">{feat}</td>
                                {[basic, pro, premium].map((val, j) => (
                                    <td key={j} className="py-3.5 text-center">
                                        {typeof val === "boolean" ? (
                                            val ? (
                                                <Check
                                                    className="w-4 h-4 mx-auto"
                                                    style={{ color: j === 1 ? "#00C9FF" : "#98FF00" }}
                                                />
                                            ) : (
                                                <span className="text-white/20 text-base">—</span>
                                            )
                                        ) : (
                                            <span
                                                className="font-outfit font-semibold"
                                                style={{
                                                    color:
                                                        j === 0
                                                            ? "rgba(255,255,255,0.55)"
                                                            : j === 1
                                                                ? "#00C9FF"
                                                                : "#98FF00",
                                                }}
                                            >
                                                {val}
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── FAQ ────────────────────────────────────────── */}
            <div>
                <h3 className="ls-title text-xl mb-5">Preguntas frecuentes</h3>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="ls-surface rounded-2xl overflow-hidden cursor-pointer"
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        >
                            <div className="flex items-center justify-between px-5 py-4">
                                <span className="font-outfit font-semibold text-white text-sm">
                                    {faq.q}
                                </span>
                                {openFaq === i ? (
                                    <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                                )}
                            </div>
                            {openFaq === i && (
                                <div
                                    className="px-5 pb-4 text-white/55 font-inter text-sm leading-relaxed border-t"
                                    style={{ borderColor: "rgba(255,255,255,0.07)" }}
                                >
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
