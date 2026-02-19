"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, LogOut, Bell, User, Shield, CheckCircle2 } from "lucide-react"

export default function ProviderSettingsPage() {
    const { user, logout } = useAuth()
    const supabase = createClient()
    const router = useRouter()
    const [saved, setSaved] = useState(false)
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [bookingAlerts, setBookingAlerts] = useState(true)
    const [form, setForm] = useState({
        full_name: [user?.name, user?.lastname].filter(Boolean).join(' '),
        phone: "",
        website: "",
        description: "",
    })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        await supabase.from('profiles').update({
            full_name: form.full_name,
            phone: form.phone,
            website: form.website,
            description: form.description,
        }).eq('id', user.id)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Configuración</h2>
                {saved && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="w-3 h-3" /> Guardado
                    </Badge>
                )}
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4 text-primary" /> Información de Perfil
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="provider-name">Nombre o Razón Social</Label>
                            <Input
                                id="provider-name"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                                placeholder="Nombre de tu negocio"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="provider-phone">Teléfono de Contacto</Label>
                            <Input
                                id="provider-phone"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="+52 999 123 4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="provider-website">Sitio Web</Label>
                            <Input
                                id="provider-website"
                                value={form.website}
                                onChange={e => setForm({ ...form, website: e.target.value })}
                                placeholder="https://tunegocio.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="provider-description">Descripción del Negocio</Label>
                            <Textarea
                                id="provider-description"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe tus servicios y lo que te hace especial..."
                                rows={4}
                            />
                        </div>
                        <Button type="submit" className="w-full">Guardar Cambios</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="h-4 w-4 text-primary" /> Notificaciones
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                            <Label className="font-medium cursor-pointer">Notificaciones por email</Label>
                            <p className="text-sm text-muted-foreground">Recibe resúmenes de actividad diarios.</p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                            <Label className="font-medium cursor-pointer">Alertas de reservas</Label>
                            <p className="text-sm text-muted-foreground">Notificación inmediata cuando recibes una solicitud.</p>
                        </div>
                        <Switch checked={bookingAlerts} onCheckedChange={setBookingAlerts} />
                    </div>
                </CardContent>
            </Card>

            {/* Account */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4 text-primary" /> Cuenta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg border bg-muted/30">
                        <p className="text-sm text-muted-foreground">Correo electrónico</p>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
