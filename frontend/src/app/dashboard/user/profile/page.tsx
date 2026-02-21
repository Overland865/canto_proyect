"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { uploadAvatar, updatePassword as updatePassDB } from "@/lib/supabase-service"
import { createClient } from "@/lib/supabase/client"

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

export default function ProfilePage() {
    const { user, updateProfile } = useAuth()
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        email: "",
        businessName: "",
        region: "",
        phone: "",
        website: "",
    })
    const [avatarUrl, setAvatarUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [passwords, setPasswords] = useState({ new: "", confirm: "" })
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                lastname: user.lastname || "",
                email: user.email || "",
                businessName: user.businessName || "",
                region: user.region || "",
                phone: user.phone || "",
                website: user.website || "",
            })
            setAvatarUrl(user.avatar_url || "")
        }
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        })
    }

    const handleRegionChange = (value: string) => {
        setFormData({
            ...formData,
            region: value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const fullName = `${formData.name} ${formData.lastname}`.trim()
            await updateProfile({
                ...formData,
                full_name: fullName
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsUploading(true)
        try {
            const url = await uploadAvatar(supabase, user.id, file)
            setAvatarUrl(url)
            await updateProfile({ avatar_url: url })
        } catch (error) {
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    const handlePasswordUpdate = async () => {
        if (passwords.new !== passwords.confirm) {
            return toast.error("Las contraseñas no coinciden")
        }
        if (passwords.new.length < 6) {
            return toast.error("La contraseña debe tener al menos 6 caracteres")
        }

        setIsSaving(true)
        try {
            await updatePassDB(supabase, passwords.new)
            toast.success("Contraseña actualizada")
            setPasswords({ new: "", confirm: "" })
        } finally {
            setIsSaving(false)
        }
    }

    if (!user) {
        return <div>Cargando...</div>
    }

    return (
        <div className="container py-10 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">Información General</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                            <CardDescription>
                                Actualiza tu información personal aquí. Haz clic en guardar cuando termines.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center gap-4 mb-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 border-2 border-primary/10">
                                            <AvatarImage src={avatarUrl} />
                                            <AvatarFallback className="text-xl bg-primary/5">
                                                {user.name?.[0]}{user.lastname?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">Click para cambiar foto de perfil</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input id="name" value={formData.name} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastname">Apellido</Label>
                                        <Input id="lastname" value={formData.lastname} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input id="email" type="email" value={formData.email} disabled className="bg-muted" />
                                    <p className="text-[10px] text-muted-foreground">El correo no puede ser modificado por seguridad.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono de Contacto</Label>
                                        <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="+52 ..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Sitio Web / Enlace</Label>
                                        <Input id="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="region">Región</Label>
                                    <Select onValueChange={handleRegionChange} value={formData.region}>
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
                                {user.role === "provider" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Nombre del Negocio</Label>
                                        <Input id="businessName" value={formData.businessName} onChange={handleChange} />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Guardar Cambios
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contraseña</CardTitle>
                            <CardDescription>
                                Cambia tu contraseña aquí. No te pediremos la contraseña actual en esta demo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new">Nueva Contraseña</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirmar Contraseña</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handlePasswordUpdate}
                                disabled={isSaving || !passwords.new}
                            >
                                {isSaving ? "Actualizando..." : "Actualizar Contraseña"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
