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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"

export default function UserSettingsPage() {
    const { user } = useAuth()
    const supabase = createClient()
    const router = useRouter()
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const handleLogoutConfirm = async () => {
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
                    <Button variant="destructive" className="w-full" onClick={() => setShowLogoutDialog(true)}>
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                    </Button>
                </CardContent>
            </Card>

            {/* Logout Confirmation Dialog (Premium Glassmorphism) */}
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent
                    className="sm:max-w-[400px] border-white/10 text-white shadow-2xl backdrop-blur-2xl bg-[#0f1216]/95 overflow-hidden p-0"
                >
                    {/* Subtle gradient glow behind the content */}
                    <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

                    <div className="p-6 pt-8">
                        <DialogHeader className="flex flex-col items-center text-center space-y-3 relative z-10">
                            <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center mb-2 shadow-[0_0_15px_rgba(239,68,68,0.15)] hidden sm:flex">
                                <LogOut className="h-6 w-6 text-red-500 ml-1" />
                            </div>
                            <DialogTitle className="font-outfit text-2xl font-bold text-white tracking-wide">
                                ¿Cerrar Sesión?
                            </DialogTitle>
                            <DialogDescription className="text-white/60 font-inter text-sm max-w-[280px] mx-auto leading-relaxed">
                                Estás a punto de salir de tu cuenta. Tendrás que iniciar sesión la próxima vez que ingreses.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="gap-3 sm:gap-3 mt-8 relative z-10 flex-col sm:flex-row w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowLogoutDialog(false)}
                                className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all rounded-xl h-11 font-medium"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowLogoutDialog(false);
                                    handleLogoutConfirm();
                                }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all rounded-xl h-11 font-medium"
                            >
                                Cerrar Sesión
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
