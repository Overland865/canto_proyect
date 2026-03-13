"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Upload, X, Save, Image as ImageIcon, Globe, Phone, Instagram, Facebook, Users } from "lucide-react"

export function ProfileTab() {
    const { user, updateProfile } = useAuth()
    const supabase = React.useMemo(() => createClient(), [])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        region: "",
        description: "",
        phone: "",
        website: "",
        social_media: {
            instagram: "",
            facebook: "",
            tiktok: ""
        } as any,
        avatar_url: "",
        cover_image: "",
        gallery: [] as string[]
    })

    const [businessName, setBusinessName] = useState("")

    useEffect(() => {
        const loadProfile = async () => {
            if (!user) {
                // If auth context finished loading and user is null, stop spinning
                // so we don't get stuck in eternal load.
                setIsLoading(false)
                return
            }

            try {
                // 1. Fetch Profile Data
                console.log("DEBUG - Loading profiles for ID:", user.id)
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error && error.code !== 'PGRST116') {
                    console.error("DEBUG - Profiles query error:", error)
                }

                // 2. Fetch Provider Details
                const { data: providerProfile, error: providerError } = await supabase
                    .from('provider_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (providerError && providerError.code !== 'PGRST116') {
                    console.error("DEBUG - Provider profiles query error:", providerError)
                }

                if (providerProfile) {
                    setBusinessName(providerProfile.business_name || "")
                }

                if (profile || providerProfile) {
                    const fullName = profile?.full_name || ""
                    const nameParts = fullName.split(' ')
                    const name = nameParts[0] || ""
                    const lastname = nameParts.slice(1).join(' ') || ""

                    setFormData({
                        name: name,
                        lastname: lastname,
                        region: providerProfile?.location || "",
                        description: providerProfile?.description || "",
                        phone: providerProfile?.contact_phone || profile?.phone || "",
                        website: profile?.website || providerProfile?.contact_website || "",
                        social_media: providerProfile?.social_media || profile?.social_media || { instagram: "", facebook: "", tiktok: "" },
                        avatar_url: profile?.avatar_url || "",
                        cover_image: profile?.cover_image || providerProfile?.logo_url || "",
                        gallery: profile?.gallery || providerProfile?.gallery_images || []
                    })
                }

            } catch (error) {
                console.error("DEBUG - Error loading profile:", error)
                toast.error("Error al cargar el perfil")
            } finally {
                setIsLoading(false)
            }
        }

        // Add a safety timeout just in case it hangs forever
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false)
        }, 5000)

        loadProfile().then(() => clearTimeout(safetyTimeout))

        return () => clearTimeout(safetyTimeout)
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover' | 'gallery') => {
        if (!e.target.files || e.target.files.length === 0) return
        if (!user) return

        const files = Array.from(e.target.files)
        const toastId = toast.loading(files.length > 1 ? `Subiendo ${files.length} imágenes...` : "Subiendo imagen...")

        try {
            const uploadedUrls: string[] = []

            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const folder = type === 'avatar' ? 'avatars' : (type === 'cover' ? 'covers' : 'gallery')
                const fileName = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('profile-images')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('profile-images')
                    .getPublicUrl(filePath)

                uploadedUrls.push(publicUrl)
            }

            if (type === 'avatar') {
                setFormData(prev => ({ ...prev, avatar_url: uploadedUrls[0] }))
            } else if (type === 'cover') {
                setFormData(prev => ({ ...prev, cover_image: uploadedUrls[0] }))
            } else {
                setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }))
            }

            toast.dismiss(toastId)
            toast.success(files.length > 1 ? `${files.length} imágenes subidas correctamente` : "Imagen subida correctamente")

        } catch (error) {
            console.error("Error uploading image:", error)
            toast.dismiss(toastId)
            toast.error("Error al subir la(s) imagen(es)")
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
            // 1. Base Profile Fields (profiles table)
            const profileData = {
                full_name: `${formData.name} ${formData.lastname}`.trim(),
                phone: formData.phone,
                avatar_url: formData.avatar_url,
            }

            await updateProfile(profileData)

            // 2. Provider Profile Fields (provider_profiles table)
            const providerProfileData = {
                business_name: businessName,
                contact_phone: formData.phone,
                contact_website: formData.website,
                description: formData.description,
                location: formData.region,
                social_media: formData.social_media,
                logo_url: formData.cover_image || null,
                gallery_images: formData.gallery
            }

            const { error: providerError } = await supabase
                .from('provider_profiles')
                .update(providerProfileData)
                .eq('id', user.id)

            if (providerError) {
                console.error("Provider profile update error:", providerError)
                toast.warning(`Error proveedor: ${providerError.message || 'Desconocido'}`)
                return // Prevent success if half of it failed
            }

            toast.success("Perfil guardado exitosamente")
            // Success toast is handled by updateProfile unless there's an error
        } catch (error: any) {
            console.error("Error saving profile:", JSON.stringify(error))
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
                    <h1 className="ls-title text-3xl tracking-tight">Perfil</h1>
                    <p className="text-white/50 font-inter text-sm mt-1">Administra tu perfil público y preferencias de cuenta.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="ls-btn-cta flex items-center gap-2"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full grid grid-cols-4 p-1 rounded-2xl border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <TabsTrigger value="general" className="rounded-xl text-sm font-outfit font-semibold transition-all duration-200 text-white/50 hover:text-white/80 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(0,250,255,0.15)] data-[state=active]:border data-[state=active]:border-ls-cyan/30">Información</TabsTrigger>
                    <TabsTrigger value="images" className="rounded-xl text-sm font-outfit font-semibold transition-all duration-200 text-white/50 hover:text-white/80 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(0,250,255,0.15)] data-[state=active]:border data-[state=active]:border-ls-cyan/30">Imágenes</TabsTrigger>
                    <TabsTrigger value="social" className="rounded-xl text-sm font-outfit font-semibold transition-all duration-200 text-white/50 hover:text-white/80 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(0,250,255,0.15)] data-[state=active]:border data-[state=active]:border-ls-cyan/30">Redes y Contacto</TabsTrigger>
                    <TabsTrigger value="account" className="rounded-xl text-sm font-outfit font-semibold transition-all duration-200 text-white/50 hover:text-white/80 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-[0_0_12px_rgba(0,250,255,0.15)] data-[state=active]:border data-[state=active]:border-ls-cyan/30">Cuenta</TabsTrigger>
                </TabsList>

                {/* --- pestaña GENERAL --- */}
                <TabsContent value="general" className="space-y-4 py-4">
                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Información Personal</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">Tus datos básicos de perfil.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstName" className="text-white/60 font-inter text-xs uppercase tracking-wider">Nombre</Label>
                                    <input
                                        id="firstName"
                                        className="ls-input"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="lastName" className="text-white/60 font-inter text-xs uppercase tracking-wider">Apellidos</Label>
                                    <input
                                        id="lastName"
                                        className="ls-input"
                                        value={formData.lastname}
                                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                                        placeholder="Tus apellidos"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="region" className="text-white/60 font-inter text-xs uppercase tracking-wider">Región / Ubicación</Label>
                                <input
                                    id="region"
                                    className="ls-input"
                                    value={formData.region}
                                    onChange={(e) => handleInputChange('region', e.target.value)}
                                    placeholder="Ej: CDMX, Monterrey, etc."
                                />
                                <p className="text-white/35 font-inter text-xs">Indica la zona principal donde ofreces tus servicios.</p>
                            </div>
                        </div>
                    </div>

                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Información del Negocio</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">Datos básicos que verán tus clientes.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="businessName" className="text-white/60 font-inter text-xs uppercase tracking-wider">Nombre del Negocio</Label>
                                <input
                                    id="businessName"
                                    className="ls-input"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Nombre de tu negocio"
                                />
                                <p className="text-white/35 font-inter text-xs">Este es el nombre público que verán tus clientes.</p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-white/60 font-inter text-xs uppercase tracking-wider">Descripción</Label>
                                <textarea
                                    id="description"
                                    placeholder="Cuéntanos sobre tu negocio, tu experiencia y lo que ofreces..."
                                    className="ls-input min-h-[150px] resize-none"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- pestaña IMAGENES --- */}
                <TabsContent value="images" className="space-y-4 py-4">
                    {/* Profile Picture (Avatar) */}
                    {/* Profile Picture (Avatar) */}
                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Foto de Perfil</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">Esta foto aparecerá junto a tu nombre en comentarios y búsquedas.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative h-24 w-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 overflow-hidden group shrink-0">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-8 h-8 text-white/40" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                                        <Upload className="w-5 h-5 text-white" />
                                    </Label>
                                </div>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, 'avatar')}
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/80">Sube una foto clara</p>
                                <p className="text-xs text-white/40 font-inter">Formato JPG, PNG o WebP. Máximo 2MB.</p>
                                <button className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors border border-white/10" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                    Subir Foto
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Imagen de Portada</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">Esta imagen aparecerá en la parte superior de tu perfil público.</p>
                        </div>
                        <div className="aspect-video w-full relative rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 overflow-hidden group">
                            {formData.cover_image ? (
                                <>
                                    <img src={formData.cover_image} alt="Portada" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Label htmlFor="cover-upload" className="cursor-pointer">
                                            <div className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20">Cambiar Imagen</div>
                                        </Label>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-white/40">
                                    <ImageIcon className="w-10 h-10" />
                                    <span className="font-inter text-sm">Subir imagen de portada</span>
                                </div>
                            )}
                            <input
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
                    </div>

                    {/* Gallery */}
                    <div className="ls-glass p-6 space-y-4">
                        <div className="flex justify-between items-end pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <div>
                                <h3 className="ls-title text-sm">Galería de Fotos</h3>
                                <p className="text-white/35 font-inter text-xs mt-1">Muestra tus mejores trabajos.</p>
                            </div>
                            <div>
                                <input
                                    id="gallery-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, 'gallery')}
                                />
                                <button className="flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors border border-white/10" onClick={() => document.getElementById('gallery-upload')?.click()}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Agregar Foto
                                </button>
                            </div>
                        </div>
                        <div className="pt-2">
                            {formData.gallery.length === 0 ? (
                                <div className="text-center py-12 text-white/40 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                    No hay fotos en la galería aún.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.gallery.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10 bg-white/5">
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                onClick={() => removeGalleryImage(idx)}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- pestaña SOCIAL y CONTACTO --- */}
                <TabsContent value="social" className="space-y-4 py-4">
                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Contacto</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">¿Cómo pueden contactarte tus clientes?</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-white/60 font-inter text-xs uppercase tracking-wider">Teléfono / WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input
                                        id="phone"
                                        className="ls-input pl-10"
                                        placeholder="+52 55 1234 5678"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="website" className="text-white/60 font-inter text-xs uppercase tracking-wider">Sitio Web</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input
                                        id="website"
                                        className="ls-input pl-10"
                                        placeholder="https://mi-negocio.com"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Redes Sociales</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">Conecta tus perfiles sociales.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="instagram" className="text-white/60 font-inter text-xs uppercase tracking-wider">Instagram</Label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input
                                        id="instagram"
                                        className="ls-input pl-10"
                                        placeholder="@usuario"
                                        value={formData.social_media.instagram}
                                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="facebook" className="text-white/60 font-inter text-xs uppercase tracking-wider">Facebook</Label>
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <input
                                        id="facebook"
                                        className="ls-input pl-10"
                                        placeholder="Nombre de página"
                                        value={formData.social_media.facebook}
                                        onChange={(e) => handleSocialChange('facebook', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>


                {/* --- pestaña CUENTA --- */}
                <TabsContent value="account" className="space-y-4 py-4">
                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Seguridad de la Cuenta</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">Administra tu contraseña y métodos de acceso.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-white/60 font-inter text-xs uppercase tracking-wider">Correo Electrónico</Label>
                                <input value={user?.email || ''} disabled className="ls-input opacity-50 cursor-not-allowed" />
                            </div>
                            <div className="pt-2">
                                <button className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-colors border border-white/10" onClick={() => toast.info("Funcionalidad de cambio de contraseña próximamente.")}>
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="ls-glass p-6 space-y-4">
                        <div className="pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <h3 className="ls-title text-sm">Notificaciones</h3>
                            <p className="text-white/35 font-inter text-xs mt-1">Elige qué notificaciones quieres recibir.</p>
                        </div>
                        <div className="pt-2">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="n-emails" className="flex flex-col space-y-1">
                                    <span className="text-white/80 font-inter text-sm font-medium">Correos electrónicos</span>
                                    <span className="font-normal text-white/40 text-xs">Recibe correos sobre nuevas reservas.</span>
                                </Label>
                                {/* Placeholder switches matching dark theme */}
                                <div className="h-6 w-11 bg-white/20 rounded-full relative cursor-pointer border border-white/10" onClick={() => toast.success("Preferencias guardadas")}>
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm shadow-[#E3215D]/50 border border-white"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    )
}
