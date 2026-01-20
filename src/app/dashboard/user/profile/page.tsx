"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                lastname: user.lastname || "",
                email: user.email || "",
                businessName: user.businessName || "",
                region: user.region || "",
            })
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateProfile(formData)
        alert("Perfil actualizado correctamente")
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
                            <CardContent className="space-y-4">
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
                                    <Input id="email" type="email" value={formData.email} onChange={handleChange} />
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
                                <Button type="submit">Guardar Cambios</Button>
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
                                <Label htmlFor="new-password">Nueva Contraseña</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Actualizar Contraseña</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
