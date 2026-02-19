"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LogOut, Bell, Shield } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function UserSettingsPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const router = useRouter()
    const [emailNotifications, setEmailNotifications] = useState(true)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" /> Notificaciones
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                            <Label className="font-medium">Notificaciones por email</Label>
                            <p className="text-sm text-muted-foreground">Recibe actualizaciones de tus reservas por correo.</p>
                        </div>
                        <Switch
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" /> Cuenta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg border bg-muted/30">
                        <p className="text-sm text-muted-foreground">Correo electrónico</p>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
