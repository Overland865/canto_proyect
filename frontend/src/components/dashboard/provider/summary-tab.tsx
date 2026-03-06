"use client"

import { CircleDollarSign, AlertCircle, Activity } from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface SummaryTabProps {
    income: number
    pendingBookings: number
    totalBookings: number
    chartData: any[]
}

const statCards = [
    {
        key: "income",
        label: "Ingresos Totales",
        sub: "Ingresos confirmados",
        icon: CircleDollarSign,
        iconColor: "#98FF00",
        iconBg: "rgba(152,255,0,0.10)",
        valueColor: "#98FF00",
    },
    {
        key: "pending",
        label: "Reservas Nuevas",
        sub: "Esperando tu respuesta",
        icon: AlertCircle,
        iconColor: "#FFB800",
        iconBg: "rgba(255,184,0,0.10)",
        valueColor: "#FFB800",
    },
    {
        key: "total",
        label: "Total Reservas",
        sub: "Historial acumulado",
        icon: Activity,
        iconColor: "#00C9FF",
        iconBg: "rgba(0,201,255,0.10)",
        valueColor: "#00C9FF",
    },
]

export function SummaryTab({ income, pendingBookings, totalBookings, chartData }: SummaryTabProps) {
    const values = [
        `$${income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `${pendingBookings}`,
        `${totalBookings}`,
    ]

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ── Stat cards ─────────────────────────────── */}
            <div className="grid gap-4 md:grid-cols-3">
                {statCards.map((card, i) => {
                    const Icon = card.icon
                    return (
                        <div key={card.key} className="ls-glass p-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-white/50 font-inter text-xs uppercase tracking-wider mb-2">
                                    {card.label}
                                </p>
                                <p
                                    className="font-outfit font-bold text-3xl"
                                    style={{ color: card.valueColor }}
                                >
                                    {values[i]}
                                </p>
                                <p className="text-white/40 font-inter text-xs mt-1">{card.sub}</p>
                            </div>
                            <span
                                className="flex-shrink-0 rounded-xl p-3 mt-0.5"
                                style={{ background: card.iconBg }}
                            >
                                <Icon className="h-5 w-5" style={{ color: card.iconColor }} />
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* ── Weekly chart ───────────────────────────── */}
            <div className="ls-glass p-6">
                <h3 className="ls-title text-lg mb-1">Ingresos Semanales</h3>
                <p className="text-white/40 font-inter text-sm mb-6">
                    Rendimiento de los últimos 7 días
                </p>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="rgba(255,255,255,0.06)"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.40)', fontFamily: 'Inter' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.40)', fontFamily: 'Inter' }}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div
                                                className="rounded-xl p-3 border"
                                                style={{
                                                    background: "#1A1F25",
                                                    borderColor: "rgba(255,255,255,0.10)",
                                                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                                                }}
                                            >
                                                <p className="text-white/50 font-inter text-xs mb-1">
                                                    {payload[0].payload.fullDate}
                                                </p>
                                                <p className="font-outfit font-bold text-sm" style={{ color: "#98FF00" }}>
                                                    ${(payload[0].value as number)?.toLocaleString()}
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="income" radius={[6, 6, 0, 0]} barSize={36}>
                                {chartData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 6
                                            ? "url(#barGradientActive)"
                                            : "rgba(0,82,212,0.45)"
                                        }
                                    />
                                ))}
                            </Bar>
                            <defs>
                                <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00C9FF" />
                                    <stop offset="100%" stopColor="#0052D4" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
