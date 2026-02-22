"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Por favor completa todos los campos")
            return
        }

        setLoading(true)
        try {
            await login({ email, password })
        } catch (error: any) {
            console.error(error)
            toast.error("Error al iniciar sesión", {
                description: error.message || "Credenciales incorrectas"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Bienvenido de nuevo</CardTitle>
                <CardDescription>
                    Ingresa tus credenciales para acceder a Local_Space
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
                <div className="p-6 pt-0 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Contraseña</Label>
                            <Link href="#" className="text-sm text-primary hover:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                </div>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-muted-foreground">
                        ¿Aún no tienes una cuenta?{" "}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Regístrate
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
