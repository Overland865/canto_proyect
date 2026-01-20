"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
    const { login } = useAuth()
    const [clientEmail, setClientEmail] = useState("")
    const [providerEmail, setProviderEmail] = useState("")

    const handleClientLogin = () => {
        login({
            name: "Juan",
            lastname: "Pérez",
            email: clientEmail || "cliente@ejemplo.com",
            role: "client"
        })
    }

    const handleProviderLogin = () => {
        login({
            name: "María",
            lastname: "Gómez",
            email: providerEmail || "proveedor@ejemplo.com",
            role: "provider",
            businessName: "Banquetes María"
        })
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Bienvenido de nuevo</CardTitle>
                <CardDescription>
                    Ingresa tus credenciales para acceder a Local_Space
                </CardDescription>
            </CardHeader>
            <Tabs defaultValue="client" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="client">Cliente</TabsTrigger>
                    <TabsTrigger value="provider">Proveedor</TabsTrigger>
                </TabsList>
                <div className="p-4 pb-0">
                    <TabsContent value="client">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-client">Correo Electrónico</Label>
                                <Input
                                    id="email-client"
                                    type="email"
                                    placeholder="m@ejemplo.com"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password-client">Contraseña</Label>
                                    <Link href="#" className="text-sm text-primary hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <Input id="password-client" type="password" />
                            </div>
                            <Button className="w-full" onClick={handleClientLogin}>Iniciar Sesión</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="provider">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-provider">Correo de Negocio</Label>
                                <Input
                                    id="email-provider"
                                    type="email"
                                    placeholder="contacto@negocio.com"
                                    value={providerEmail}
                                    onChange={(e) => setProviderEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password-provider">Contraseña</Label>
                                    <Link href="#" className="text-sm text-primary hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <Input id="password-provider" type="password" />
                            </div>
                            <Button className="w-full" onClick={handleProviderLogin}>Iniciar Sesión</Button>
                        </div>
                    </TabsContent>
                </div>
                <CardFooter className="flex flex-col gap-4 mt-4">
                    <div className="text-center text-sm text-muted-foreground">
                        ¿Aun no tienes una cuenta?{" "}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Regístrate
                        </Link>
                    </div>
                </CardFooter>
            </Tabs>
        </Card>
    )
}
