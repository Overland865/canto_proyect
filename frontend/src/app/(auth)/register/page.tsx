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

    // Provider State
    const [businessName, setBusinessName] = useState("")
    const [providerEmail, setProviderEmail] = useState("")
    const [providerPassword, setProviderPassword] = useState("")
    const [providerCategory, setProviderCategory] = useState("")
    const [providerPhone, setProviderPhone] = useState("")

    const handleClientRegister = async () => {
        if (!clientName || !clientLastname || !clientEmail || !clientPassword) {
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
                role: "consumer"
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
        if (!businessName || !providerEmail || !providerPassword || !providerCategory || !providerPhone) {
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
                category: providerCategory,
                phone: providerPhone
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
            <div className="relative ls-glass w-full p-10 max-w-md mx-auto shadow-2xl flex flex-col space-y-8 overflow-hidden bg-[#1A1F25]/80">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-ls-lemon/20 blur-[80px] pointer-events-none" />

                <div className="space-y-3 text-center relative z-10">
                    <h1 className="ls-title text-3xl font-extrabold tracking-tight bg-gradient-to-r from-ls-lemon to-white bg-clip-text text-transparent">
                        Verifica tu correo
                    </h1>
                    <p className="text-white/60 text-sm font-inter">
                        Ingresa el código de 6 dígitos enviado a <span className="text-white font-medium">{verificationEmail}</span>
                    </p>
                </div>
                <div className="flex flex-col space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="otp" className="text-white/80 font-inter text-sm flex justify-center">Código de Verificación</Label>
                        <Input
                            id="otp"
                            placeholder="123456"
                            className="ls-input text-center text-2xl tracking-widest font-outfit font-semibold"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <Button className="w-full ls-btn-cta h-12 text-base mt-2 shadow-[0_0_20px_rgba(152,255,0,0.25)] hover:shadow-[0_0_25px_rgba(152,255,0,0.4)] transition-all bg-gradient-to-r from-[#7EE600] to-ls-lemon text-black" disabled={loading} onClick={handleVerify}>
                        {loading ? "Verificando..." : "Verificar Cuenta"}
                    </Button>
                    <div className="text-center mt-4">
                        <Button variant="link" className="text-xs text-white/50 hover:text-white transition-colors" onClick={() => setStep("register")}>
                            Volver al registro
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative ls-glass w-full p-8 sm:p-10 max-w-xl mx-auto shadow-2xl flex flex-col space-y-6 overflow-hidden bg-[#1A1F25]/80">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-40 bg-ls-blue/20 blur-[100px] pointer-events-none" />

            <div className="space-y-3 text-center relative z-10">
                <h1 className="ls-title text-3xl font-extrabold tracking-tight bg-gradient-to-r from-ls-blue via-ls-cyan to-white bg-clip-text text-transparent">
                    Crear una cuenta
                </h1>
                <p className="text-white/60 text-sm font-inter">
                    Únete a Local_Space para empezar a planear o vender
                </p>
            </div>

            <Tabs defaultValue="client" className="w-full relative z-10">
                <TabsList className="flex w-full bg-[#1A1F25]/60 border border-white/10 p-1 rounded-xl mb-8 relative z-10 backdrop-blur-md">
                    <TabsTrigger
                        value="client"
                        className="flex-1 rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-ls-blue data-[state=active]:to-ls-cyan data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(0,201,255,0.3)] text-white/50 transition-all font-outfit font-bold tracking-wide hover:text-white data-[state=inactive]:hover:bg-white/5"
                    >
                        Cliente
                    </TabsTrigger>
                    <TabsTrigger
                        value="provider"
                        className="flex-1 rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-ls-cyan data-[state=active]:to-ls-lemon data-[state=active]:text-black data-[state=active]:shadow-[0_0_15px_rgba(152,255,0,0.3)] text-white/50 transition-all font-outfit font-bold tracking-wide hover:text-white data-[state=inactive]:hover:bg-white/5"
                    >
                        Proveedor
                    </TabsTrigger>
                </TabsList>

                <div className="pt-2">
                    <TabsContent value="client" className="space-y-5 m-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white/80 font-inter text-sm font-medium">Nombre</Label>
                                <Input
                                    id="name"
                                    placeholder="Tu nombre"
                                    className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-cyan focus:border-ls-cyan"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastname" className="text-white/80 font-inter text-sm font-medium">Apellido</Label>
                                <Input
                                    id="lastname"
                                    placeholder="Tu apellido"
                                    className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-cyan focus:border-ls-cyan"
                                    value={clientLastname}
                                    onChange={(e) => setClientLastname(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="email" className="text-white/80 font-inter text-sm font-medium">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@ejemplo.com"
                                className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-cyan focus:border-ls-cyan"
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="password" className="text-white/80 font-inter text-sm font-medium">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-cyan focus:border-ls-cyan"
                                value={clientPassword}
                                onChange={(e) => setClientPassword(e.target.value)}
                            />
                        </div>
                        <div className="pt-4 mt-2 border-t border-white/10">
                            <Button className="w-full ls-btn-cta h-12 text-base mt-2 shadow-[0_0_20px_rgba(0,201,255,0.25)] hover:shadow-[0_0_25px_rgba(0,201,255,0.4)] transition-all bg-gradient-to-r from-ls-blue to-ls-cyan" disabled={loading} onClick={handleClientRegister}>
                                {loading ? "Creando cuenta..." : "Registrarse como Cliente"}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="provider" className="space-y-4 m-0">
                        <div className="space-y-2">
                            <Label htmlFor="business-name" className="text-white/80 font-inter text-sm font-medium">Nombre del Negocio</Label>
                            <Input
                                id="business-name"
                                placeholder="Ej. Banquetes Delicia"
                                className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-lemon focus:border-ls-lemon"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email-provider" className="text-white/80 font-inter text-sm font-medium">Correo de Negocio</Label>
                            <Input
                                id="email-provider"
                                type="email"
                                placeholder="contacto@negocio.com"
                                className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-lemon focus:border-ls-lemon"
                                value={providerEmail}
                                onChange={(e) => setProviderEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category-provider" className="text-white/80 font-inter text-sm font-medium">Categoría</Label>
                                <Select onValueChange={setProviderCategory} value={providerCategory}>
                                    <SelectTrigger className="w-full bg-black/40 border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-ls-lemon focus:border-ls-lemon h-12 px-3 py-2 text-sm font-inter transition-all">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1F25] border border-white/10 text-white">
                                        <SelectItem value="Locales y Salones" className="focus:bg-white/10 focus:text-white">Locales y Salones</SelectItem>
                                        <SelectItem value="Banquetes" className="focus:bg-white/10 focus:text-white">Banquetes</SelectItem>
                                        <SelectItem value="Música y Shows" className="focus:bg-white/10 focus:text-white">Música y Shows</SelectItem>
                                        <SelectItem value="Foto y Video" className="focus:bg-white/10 focus:text-white">Foto y Video</SelectItem>
                                        <SelectItem value="Inflables" className="focus:bg-white/10 focus:text-white">Inflables</SelectItem>
                                        <SelectItem value="Barra Libre" className="focus:bg-white/10 focus:text-white">Barra Libre</SelectItem>
                                        <SelectItem value="Mesa de Dulces" className="focus:bg-white/10 focus:text-white">Mesa de Dulces</SelectItem>
                                        <SelectItem value="Meseros" className="focus:bg-white/10 focus:text-white">Meseros</SelectItem>
                                        <SelectItem value="Mobiliario" className="focus:bg-white/10 focus:text-white">Mobiliario</SelectItem>
                                        <SelectItem value="Decoraciones" className="focus:bg-white/10 focus:text-white">Decoraciones</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone-provider" className="text-white/80 font-inter text-sm font-medium">WhatsApp</Label>
                                <Input
                                    id="phone-provider"
                                    placeholder="10 dígitos"
                                    className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-lemon focus:border-ls-lemon"
                                    value={providerPhone}
                                    onChange={(e) => setProviderPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="password-provider" className="text-white/80 font-inter text-sm font-medium">Contraseña</Label>
                            <Input
                                id="password-provider"
                                type="password"
                                className="ls-input h-12 bg-black/40 border-white/10 transition-all focus:ring-1 focus:ring-ls-lemon focus:border-ls-lemon"
                                value={providerPassword}
                                onChange={(e) => setProviderPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex items-start space-x-3 pt-3 bg-black/40 p-4 rounded-xl border border-white/10 mt-2">
                            <Checkbox id="terms" className="mt-0.5 border-white/30 data-[state=checked]:bg-[#98FF00] data-[state=checked]:text-[#0F1216] data-[state=checked]:border-[#98FF00] w-5 h-5" />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none text-white/90"
                                >
                                    Acepto proceso de verificación
                                </Label>
                                <p className="text-xs text-white/50 font-inter leading-relaxed">
                                    Acepto compartir documentación para validar mi negocio.
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 mt-2 border-t border-white/10">
                            <Button className="w-full ls-btn-cta h-12 text-base mt-2 shadow-[0_0_20px_rgba(152,255,0,0.25)] hover:shadow-[0_0_25px_rgba(152,255,0,0.4)] transition-all bg-gradient-to-r from-[#7EE600] to-ls-lemon text-black" disabled={loading} onClick={handleProviderRegister}>
                                {loading ? "Creando cuenta..." : "Registrar Negocio"}
                            </Button>
                        </div>
                    </TabsContent>
                </div>

                <div className="text-center text-sm text-white/60 font-inter mt-6">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="text-[#0052D4] hover:underline font-medium transition-colors">
                        Inicia Sesión
                    </Link>
                </div>
            </Tabs>
        </div>
    )
}
