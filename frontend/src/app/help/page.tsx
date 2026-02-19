import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, MessageCircle, Phone, ChevronRight } from "lucide-react"

const faqs = [
    {
        question: "¿Cómo funciona Local_Space?",
        answer: "Local_Space es un marketplace donde puedes encontrar y contratar proveedores de servicios para eventos. Explora el catálogo, cotiza servicios, y coordina todo desde un solo lugar."
    },
    {
        question: "¿Cómo realizo una reserva?",
        answer: "Encuentra el servicio que buscas, haz clic en 'Reservar', elige fecha y hora, agrega los detalles de tu evento y envía la solicitud. El proveedor la revisará y confirmará."
    },
    {
        question: "¿Cómo pago por un servicio?",
        answer: "Una vez que el proveedor confirme tu solicitud, podrás pagar de forma segura con tarjeta de crédito o débito a través de Stripe desde tu dashboard."
    },
    {
        question: "¿Puedo cancelar una reserva?",
        answer: "Sí, puedes contactar al proveedor para coordinar una cancelación. Las políticas de reembolso varían según el proveedor."
    },
    {
        question: "¿Cómo me registro como proveedor?",
        answer: "Crea una cuenta eligiendo el rol 'Proveedor', completa tu perfil de negocio y espera la verificación de nuestro equipo, que normalmente tarda 1-2 días hábiles."
    },
    {
        question: "¿Los proveedores están verificados?",
        answer: "Sí. Verificamos la identidad y la legitimidad de cada negocio antes de aprobar su publicación en el catálogo."
    },
]

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">Centro de Ayuda</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        ¿En qué podemos ayudarte?
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Encuentra respuestas rápidas a las preguntas más comunes sobre Local_Space.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
                    {[
                        { icon: Search, title: "Explorar Catálogo", desc: "Descubre cómo buscar y filtrar servicios", href: "/marketplace" },
                        { icon: BookOpen, title: "Guía de Inicio", desc: "Paso a paso para tu primera reserva", href: "#faqs" },
                        { icon: MessageCircle, title: "Contáctanos", desc: "Habla directamente con nuestro equipo", href: "/contact" },
                    ].map(({ icon: Icon, title, desc, href }) => (
                        <Link href={href} key={title}>
                            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                                <CardContent className="flex items-start gap-4 p-6">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{title}</h3>
                                        <p className="text-sm text-muted-foreground">{desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* FAQs */}
                <div className="max-w-3xl mx-auto" id="faqs">
                    <h2 className="text-2xl font-bold mb-8 text-center">Preguntas frecuentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq) => (
                            <Card key={faq.question}>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold mb-2 flex items-start gap-2">
                                        <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        {faq.question}
                                    </h3>
                                    <p className="text-muted-foreground text-sm pl-7">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-16 text-center bg-primary/5 border border-primary/20 rounded-2xl p-10 max-w-2xl mx-auto">
                    <Phone className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">¿No encontraste lo que buscabas?</h2>
                    <p className="text-muted-foreground mb-6">Nuestro equipo está listo para ayudarte.</p>
                    <Link href="/contact">
                        <Button>Contactar Soporte</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
