"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
                <p className="text-muted-foreground">Administra la información de tu negocio y preferencias de cuenta.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="profile">Perfil de Negocio</TabsTrigger>
                    <TabsTrigger value="account">Cuenta y Seguridad</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Negocio</CardTitle>
                            <CardDescription>
                                Esta información será visible para los usuarios en tu perfil público de proveedor.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Nombre del Negocio</Label>
                                    <Input id="businessName" defaultValue="Eventos Premium MX" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoría Principal</Label>
                                    <Input id="category" defaultValue="Banquetes" disabled />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    className="min-h-[100px]"
                                    defaultValue="Somos una empresa dedicada a crear experiencias gastronómicas inolvidables para todo tipo de eventos..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                                    <Input id="phone" type="tel" defaultValue="55 1234 5678" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Sitio Web</Label>
                                    <Input id="website" type="url" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección Física</Label>
                                <Input id="address" defaultValue="Av. Reforma 123, CDMX" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                            <Button>Guardar Cambios</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias de Notificación</CardTitle>
                            <CardDescription>Elige cómo quieres recibir las actualizaciones.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="n-emails" className="flex flex-col space-y-1">
                                    <span>Correos electrónicos</span>
                                    <span className="font-normal text-muted-foreground text-xs">Recibe correos sobre nuevas reservas.</span>
                                </Label>
                                <Switch id="n-emails" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="n-messages" className="flex flex-col space-y-1">
                                    <span>Mensajes directos</span>
                                    <span className="font-normal text-muted-foreground text-xs">Notificación cuando recibes un mensaje nuevo.</span>
                                </Label>
                                <Switch id="n-messages" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="n-marketing" className="flex flex-col space-y-1">
                                    <span>Novedades y Marketing</span>
                                    <span className="font-normal text-muted-foreground text-xs">Recibe noticias sobre la plataforma.</span>
                                </Label>
                                <Switch id="n-marketing" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
