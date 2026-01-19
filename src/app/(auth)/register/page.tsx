"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"

const REGIONS = [
    "CDMX",
    "Estado de México",
    "Jalisco",
    "Nuevo León",
    "Puebla",
    "Querétaro",
    "Yucatán",
    "Morelos"
]

export default function RegisterPage() {
    const { register } = useAuth()

    // Client State
    const [clientName, setClientName] = useState("")
    const [clientLastname, setClientLastname] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [clientRegion, setClientRegion] = useState("")

    // Provider State
    const [businessName, setBusinessName] = useState("")
    const [providerEmail, setProviderEmail] = useState("")
    const [providerRegion, setProviderRegion] = useState("")

    const handleClientRegister = () => {
        register({
            name: clientName || "Nuevo",
            lastname: clientLastname || "Usuario",
            email: clientEmail || "nuevo@ejemplo.com",
            role: "client",
            region: clientRegion || "CDMX"
        })
    }

    const handleProviderRegister = () => {
        register({
            name: "Proveedor",
            lastname: "Admin",
            email: providerEmail || "nuevo@negocio.com",
            role: "provider",
            businessName: businessName || "Nuevo Negocio",
            region: providerRegion || "CDMX"
        })
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Crear una cuenta</CardTitle>
                <CardDescription>
                    Únete a Local_Space para empezar a planear o vender
                </CardDescription>
            </CardHeader>
            <Tabs defaultValue="client" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="client">Cliente</TabsTrigger>
                    <TabsTrigger value="provider">Proveedor</TabsTrigger>
                </TabsList>
                <div className="p-4 pb-0">
                    <TabsContent value="client" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    placeholder="Tu nombre"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastname">Apellido</Label>
                                <Input
                                    id="lastname"
                                    placeholder="Tu apellido"
                                    value={clientLastname}
                                    onChange={(e) => setClientLastname(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@ejemplo.com"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="region">Región</Label>
                            <Select onValueChange={setClientRegion} defaultValue={clientRegion}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu región" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map((region) => (
                                        <SelectItem key={region} value={region}>{region}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" />
                        </div>
                        <Button className="w-full" onClick={handleClientRegister}>Registrarse</Button>
                    </TabsContent>
                    <TabsContent value="provider" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="business-name">Nombre del Negocio</Label>
                            <Input
                                id="business-name"
                                placeholder="Ej. Banquetes Delicia"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />
                        </div>
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
                            <Label htmlFor="region-provider">Región</Label>
                            <Select onValueChange={setProviderRegion} defaultValue={providerRegion}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu región" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map((region) => (
                                        <SelectItem key={region} value={region}>{region}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password-provider">Contraseña</Label>
                            <Input id="password-provider" type="password" />
                        </div>
                        <div className="flex items-top space-x-2 pt-2">
                            <Checkbox id="terms" />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Acepto proceso de verificación
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Acepto compartir documentación para validar mi negocio.
                                </p>
                            </div>
                        </div>
                        <Button className="w-full" onClick={handleProviderRegister}>Registrarse</Button>
                    </TabsContent>
                </div>
                <CardFooter className="flex flex-col gap-4 mt-4">
                    <div className="text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Inicia Sesión
                        </Link>
                    </div>
                </CardFooter>
            </Tabs>
        </Card>
    )
}
