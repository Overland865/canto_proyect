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

import { toast } from "sonner"

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
    const { register, verifyOtp } = useAuth()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<"register" | "verify">("register")
    const [verificationEmail, setVerificationEmail] = useState("")
    const [otp, setOtp] = useState("")

    // Client State
    const [clientName, setClientName] = useState("")
    const [clientLastname, setClientLastname] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [clientPassword, setClientPassword] = useState("")
    const [clientRegion, setClientRegion] = useState("")

    // Provider State
    const [businessName, setBusinessName] = useState("")
    const [providerEmail, setProviderEmail] = useState("")
    const [providerPassword, setProviderPassword] = useState("")
    const [providerRegion, setProviderRegion] = useState("")

    const handleClientRegister = async () => {
        if (!clientName || !clientLastname || !clientEmail || !clientPassword || !clientRegion) {
            toast.error("Por favor completa todos los campos")
            return
        }

        setLoading(true)
        try {
            const result = await register({
                name: clientName,
                lastname: clientLastname,
                email: clientEmail,
                password: clientPassword,
                role: "consumer",
                region: clientRegion
            })

            if (result && result.needsVerification) {
                setVerificationEmail(clientEmail)
                setStep("verify")
                toast.success("Código enviado a tu correo")
            }
        } catch (error: any) {
            console.error(error)
            toast.error("Error al registrar", {
                description: error.message || "Inténtalo de nuevo."
            })
        } finally {
            setLoading(false)
        }
    }

    const handleProviderRegister = async () => {
        if (!businessName || !providerEmail || !providerPassword || !providerRegion) {
            toast.error("Por favor completa todos los campos")
            return
        }

        setLoading(true)
        try {
            const result = await register({
                name: "Proveedor",
                lastname: "Admin",
                businessName,
                email: providerEmail,
                password: providerPassword,
                role: "provider",
                region: providerRegion
            })

            if (result && result.needsVerification) {
                setVerificationEmail(providerEmail)
                setStep("verify")
                toast.success("Código enviado a tu correo")
            }
        } catch (error: any) {
            console.error(error)
            toast.error("Error al registrar negocio", {
                description: error.message || "Inténtalo de nuevo."
            })
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Ingresa el código de 6 dígitos")
            return
        }
        setLoading(true)
        try {
            await verifyOtp(verificationEmail, otp, "signup")
            // verifyOtp handles redirection on success
        } catch (error: any) {
            console.error(error)
            toast.error("Código inválido", {
                description: error.message
            })
            setLoading(false)
        }
    }

    if (step === "verify") {
        return (
            <Card className="w-full shadow-lg max-w-md mx-auto">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Verifica tu correo</CardTitle>
                    <CardDescription>
                        Ingresa el código de 6 dígitos enviado a {verificationEmail}
                    </CardDescription>
                </CardHeader>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Código de Verificación</Label>
                        <Input
                            id="otp"
                            placeholder="123456"
                            className="text-center text-2xl tracking-widest"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <Button className="w-full" disabled={loading} onClick={handleVerify}>
                        {loading ? "Verificando..." : "Verificar Cuenta"}
                    </Button>
                    <div className="text-center">
                        <Button variant="link" className="text-sm text-muted-foreground" onClick={() => setStep("register")}>
                            Volver al registro
                        </Button>
                    </div>
                </div>
            </Card>
        )
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
                            <Select onValueChange={setClientRegion} value={clientRegion}>
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
                            <Input
                                id="password"
                                type="password"
                                value={clientPassword}
                                onChange={(e) => setClientPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" disabled={loading} onClick={handleClientRegister}>
                            {loading ? "Creando cuenta..." : "Registrarse"}
                        </Button>
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
                            <Select onValueChange={setProviderRegion} value={providerRegion}>
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
                            <Input
                                id="password-provider"
                                type="password"
                                value={providerPassword}
                                onChange={(e) => setProviderPassword(e.target.value)}
                            />
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
                        <Button className="w-full" disabled={loading} onClick={handleProviderRegister}>
                            {loading ? "Creando cuenta..." : "Registrarse"}
                        </Button>
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
