"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
    const [sent, setSent] = useState(false)
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // En producción aquí iría la llamada a la API de email
        setSent(true)
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-20">
                <div className="text-center mb-16">
                    <Badge variant="secondary" className="mb-4">Contacto</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Estamos aquí para ayudarte
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        ¿Tienes preguntas, sugerencias o necesitas ayuda? Escríbenos y te responderemos pronto.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
                    {/* Info */}
                    <div className="space-y-6">
                        {[
                            { icon: Mail, title: "Email", value: "hola@localspace.mx" },
                            { icon: Phone, title: "Teléfono", value: "+52 999 123 4567" },
                            { icon: MapPin, title: "Ubicación", value: "Mérida, Yucatán, México" },
                        ].map(({ icon: Icon, title, value }) => (
                            <Card key={title}>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{title}</p>
                                        <p className="font-semibold">{value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        {sent ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                                <h2 className="text-2xl font-bold mb-2">¡Mensaje enviado!</h2>
                                <p className="text-muted-foreground">Nos pondremos en contacto contigo pronto.</p>
                                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                                    Enviar otro mensaje
                                </Button>
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8">
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-name">Nombre</Label>
                                                <Input
                                                    id="contact-name"
                                                    placeholder="Tu nombre"
                                                    value={form.name}
                                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contact-email">Email</Label>
                                                <Input
                                                    id="contact-email"
                                                    type="email"
                                                    placeholder="tu@email.com"
                                                    value={form.email}
                                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-subject">Asunto</Label>
                                            <Input
                                                id="contact-subject"
                                                placeholder="¿Sobre qué nos escribes?"
                                                value={form.subject}
                                                onChange={e => setForm({ ...form, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact-message">Mensaje</Label>
                                            <Textarea
                                                id="contact-message"
                                                placeholder="Escribe tu mensaje aquí..."
                                                rows={6}
                                                value={form.message}
                                                onChange={e => setForm({ ...form, message: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" size="lg">
                                            Enviar Mensaje
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
