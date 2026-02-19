"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Upload, X, Save, Image as ImageIcon, Globe, Phone, Instagram, Facebook } from "lucide-react"

export default function ProviderProfilePage() {
    const { user } = useAuth()
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        description: "",
        phone: "",
        website: "",
        social_media: {
            instagram: "",
            facebook: "",
            tiktok: ""
        } as any,
        cover_image: "",
        gallery: [] as string[]
    })

    const [businessName, setBusinessName] = useState("")

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return

            try {
                // 1. Fetch Profile Data
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('description, phone, website, social_media, cover_image, gallery')
                    .eq('id', user.id)
                    .single()

                if (error && error.code !== 'PGRST116') throw error

                // 2. Fetch Provider Details
                const { data: providerProfile } = await supabase
                    .from('provider_profiles')
                    .select('business_name, contact_phone')
                    .eq('id', user.id)
                    .single()

                if (providerProfile) {
                    setBusinessName(providerProfile.business_name || "")
                }

                if (profile) {
                    setFormData({
                        description: profile.description || "",
                        phone: providerProfile?.contact_phone || profile.phone || "", // Priority to business phone
                        website: profile.website || "",
                        social_media: profile.social_media || { instagram: "", facebook: "", tiktok: "" },
                        cover_image: profile.cover_image || "",
                        gallery: profile.gallery || []
                    })
                }

            } catch (error) {
                console.error("Error loading profile:", error)
                toast.error("Error al cargar el perfil")
            } finally {
                setIsLoading(false)
            }
        }

        loadProfile()
    }, [user])

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSocialChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            social_media: {
                ...prev.social_media,
                [platform]: value
            }
        }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'gallery') => {
        if (!e.target.files || e.target.files.length === 0) return
        if (!user) return

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const toastId = toast.loading("Subiendo imagen...")

        try {
            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath)

            if (type === 'cover') {
                setFormData(prev => ({ ...prev, cover_image: publicUrl }))
            } else {
                setFormData(prev => ({ ...prev, gallery: [...prev.gallery, publicUrl] }))
            }

            toast.dismiss(toastId)
            toast.success("Imagen subida correctamente")

        } catch (error) {
            console.error("Error uploading image:", error)
            toast.dismiss(toastId)
            toast.error("Error al subir la imagen")
        }
    }

    const removeGalleryImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, index) => index !== indexToRemove)
        }))
    }

    const handleSave = async () => {
        if (!user) return
        setIsSaving(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    description: formData.description,
                    phone: formData.phone,
                    website: formData.website,
                    social_media: formData.social_media,
                    cover_image: formData.cover_image,
                    gallery: formData.gallery,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            // Update Provider Profile (Business Name & Contact Phone)
            const { error: providerError } = await supabase
                .from('provider_profiles')
                .update({
                    business_name: businessName,
                    contact_phone: formData.phone
                })
                .eq('id', user.id)


            if (providerError) throw providerError

            if (error) throw error
            toast.success("Perfil actualizado correctamente")

        } catch (error) {
            console.error("Error saving profile:", error)
            toast.error("Error al guardar los cambios")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">Administra tu perfil público y preferencias de cuenta.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar Cambios
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="general">Información</TabsTrigger>
                    <TabsTrigger value="images">Imágenes</TabsTrigger>
                    <TabsTrigger value="social">Redes y Contacto</TabsTrigger>
                    <TabsTrigger value="account">Cuenta</TabsTrigger>
                </TabsList>

                {/* --- pestaña GENERAL --- */}
                <TabsContent value="general" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Negocio</CardTitle>
                            <CardDescription>Datos básicos que verán tus clientes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="businessName">Nombre del Negocio</Label>
                                <Input
                                    id="businessName"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Nombre de tu negocio"
                                />
                                <p className="text-xs text-muted-foreground">Este es el nombre público que verán tus clientes.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Cuéntanos sobre tu negocio, tu experiencia y lo que ofreces..."
                                    className="min-h-[150px]"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- pestaña IMAGENES --- */}
                <TabsContent value="images" className="space-y-4 py-4">
                    {/* Cover Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagen de Portada</CardTitle>
                            <CardDescription>Esta imagen aparecerá en la parte superior de tu perfil público.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="aspect-video w-full relative rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/20 overflow-hidden group">
                                {formData.cover_image ? (
                                    <>
                                        <img src={formData.cover_image} alt="Portada" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Label htmlFor="cover-upload" className="cursor-pointer">
                                                <Button size="sm" variant="secondary" className="pointer-events-none">Cambiar Imagen</Button>
                                            </Label>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImageIcon className="w-10 h-10" />
                                        <span>Subir imagen de portada</span>
                                    </div>
                                )}
                                <Input
                                    id="cover-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, 'cover')}
                                />
                                {!formData.cover_image && (
                                    <Label htmlFor="cover-upload" className="absolute inset-0 cursor-pointer" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gallery */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Galería de Fotos</CardTitle>
                                    <CardDescription>Muestra tus mejores trabajos.</CardDescription>
                                </div>
                                <div>
                                    <Input
                                        id="gallery-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'gallery')}
                                    />
                                    <Button variant="outline" size="sm" onClick={() => document.getElementById('gallery-upload')?.click()}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Agregar Foto
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {formData.gallery.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No hay fotos en la galería aún.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.gallery.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden group border bg-muted">
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeGalleryImage(idx)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- pestaña SOCIAL y CONTACTO --- */}
                <TabsContent value="social" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contacto</CardTitle>
                            <CardDescription>¿Cómo pueden contactarte tus clientes?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        className="pl-9"
                                        placeholder="+52 55 1234 5678"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="website">Sitio Web</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="website"
                                        className="pl-9"
                                        placeholder="https://mi-negocio.com"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Redes Sociales</CardTitle>
                            <CardDescription>Conecta tus perfiles sociales.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="instagram"
                                        className="pl-9"
                                        placeholder="@usuario"
                                        value={formData.social_media.instagram}
                                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="facebook"
                                        className="pl-9"
                                        placeholder="Nombre de página"
                                        value={formData.social_media.facebook}
                                        onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


                {/* --- pestaña CUENTA --- */}
                <TabsContent value="account" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seguridad de la Cuenta</CardTitle>
                            <CardDescription>Administra tu contraseña y métodos de acceso.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Correo Electrónico</Label>
                                <Input value={user?.email || ''} disabled className="bg-muted" />
                            </div>
                            <div className="pt-4">
                                <Button variant="outline" onClick={() => toast.info("Funcionalidad de cambio de contraseña próximamente.")}>
                                    Cambiar Contraseña
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notificaciones</CardTitle>
                            <CardDescription>Elige qué notificaciones quieres recibir.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="n-emails" className="flex flex-col space-y-1">
                                    <span>Correos electrónicos</span>
                                    <span className="font-normal text-muted-foreground text-xs">Recibe correos sobre nuevas reservas.</span>
                                </Label>
                                {/* Placeholder switches */}
                                <div className="h-6 w-10 bg-primary/20 rounded-full relative cursor-pointer" onClick={() => toast.success("Preferencias guardadas")}>
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-primary rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    )
}
