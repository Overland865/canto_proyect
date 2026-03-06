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
        <div className="relative ls-glass w-full p-10 max-w-md mx-auto shadow-2xl flex flex-col space-y-8 overflow-hidden bg-[#1A1F25]/80">
            {/* Subtle inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-ls-blue/20 blur-[80px] pointer-events-none" />

            <div className="space-y-3 text-center relative z-10">
                <h1 className="ls-title text-3xl font-extrabold tracking-tight bg-gradient-to-r from-ls-blue via-ls-cyan to-white bg-clip-text text-transparent">
                    Bienvenido de nuevo
                </h1>
                <p className="text-white/60 text-sm font-inter">
                    Ingresa tus credenciales para acceder a Local_Space
                </p>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-white/80 font-inter text-sm">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@ejemplo.com"
                            className="ls-input h-12 transition-all focus:ring-1 focus:ring-ls-cyan focus:border-ls-cyan"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-white/80 font-inter text-sm">Contraseña</Label>
                            <Link href="#" className="text-xs text-ls-cyan hover:text-white hover:underline transition-colors font-medium">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            className="ls-input h-12 transition-all focus:ring-1 focus:ring-ls-cyan focus:border-ls-cyan"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full ls-btn-cta h-12 text-base mt-2 shadow-[0_0_20px_rgba(0,201,255,0.25)] hover:shadow-[0_0_25px_rgba(0,201,255,0.4)] transition-all" disabled={loading}>
                    {loading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>

                <div className="text-center text-sm text-white/50 font-inter mt-6 pt-6 border-t border-white/10">
                    ¿Aún no tienes una cuenta?{" "}
                    <Link href="/register" className="text-ls-cyan hover:text-white hover:underline font-medium transition-colors ml-1">
                        Regístrate ahora
                    </Link>
                </div>
            </form>
        </div>
    )
}
