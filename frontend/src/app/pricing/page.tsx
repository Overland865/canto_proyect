import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Shield, Star } from "lucide-react"

const plans = [
    {
        name: "Básico",
        price: "Gratis",
        description: "Para empezar a explorar Local_Space.",
        features: [
            "Acceso al catálogo completo",
            "Hasta 3 solicitudes por mes",
            "Soporte básico por email",
        ],
        badge: null,
        cta: "Comenzar Gratis",
        href: "/register",
        highlight: false,
    },
    {
        name: "Pro",
        price: "$499",
        period: "/mes",
        description: "Para organizadores de eventos frecuentes.",
        features: [
            "Solicitudes ilimitadas",
            "Gestión de presupuesto",
            "Soporte prioritario",
            "Acceso anticipado a nuevos proveedores",
        ],
        badge: "Más Popular",
        cta: "Empezar Prueba Gratis",
        href: "/register",
        highlight: true,
    },
    {
        name: "Empresarial",
        price: "Personalizado",
        description: "Para agencias y empresas con alto volumen.",
        features: [
            "Todo lo de Pro",
            "Gestor de cuenta dedicado",
            "Facturación empresarial",
            "Integraciones personalizadas",
            "SLA garantizado",
        ],
        badge: null,
        cta: "Contactar Ventas",
        href: "/contact",
        highlight: false,
    },
]

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-20">
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">Planes y Precios</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Simple y transparente
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Elige el plan que mejor se adapte a tus necesidades. Cancela cuando quieras.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={`relative flex flex-col ${plan.highlight ? "border-primary shadow-xl shadow-primary/10 scale-105" : ""}`}>
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary px-3 py-1">
                                        <Star className="w-3 h-3 mr-1" /> {plan.badge}
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="pt-8">
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-1 gap-6">
                                <ul className="space-y-3 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-sm">
                                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={plan.href}>
                                    <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <div className="flex justify-center gap-8 flex-wrap">
                        {[
                            { icon: Shield, text: "Sin contratos de permanencia" },
                            { icon: Zap, text: "Configuración en minutos" },
                            { icon: Star, text: "Soporte en español" },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-2 text-muted-foreground">
                                <Icon className="w-5 h-5 text-primary" />
                                <span className="text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
