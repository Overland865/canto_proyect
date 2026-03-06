"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Upload, Loader2, X, ImageIcon } from "lucide-react"
import { useState, useRef, useEffect, use } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useProvider } from "@/context/provider-context"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"

// Next.js 15+ Params type handling
type Params = Promise<{ id: string }>

const BACK_HREF = "/dashboard/provider"

export default function EditServicePage(props: { params: Params }) {
    const params = use(props.params)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()
    const { user } = useAuth()
    const { getMyServices, updateService } = useProvider()
    const supabase = createClient()

    // Form State
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [type, setType] = useState<"service" | "package">("service")
    const [price, setPrice] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [images, setImages] = useState<string[]>([])
    const [isFetching, setIsFetching] = useState(true)

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const services = getMyServices()
        const serviceToEdit = services.find(s => s.id === params.id)

        if (serviceToEdit) {
            setTitle(serviceToEdit.title)
            setCategory(serviceToEdit.category)
            setType(serviceToEdit.type)
            setPrice(serviceToEdit.price.toString())
            setDescription(serviceToEdit.description)
            setLocation(serviceToEdit.location)
            if (serviceToEdit.image) {
                setImages(serviceToEdit.gallery && serviceToEdit.gallery.length > 0 ? serviceToEdit.gallery : [serviceToEdit.image])
            }
            setIsFetching(false)
        } else if (services.length > 0) {
            toast.error("Servicio no encontrado")
            router.push(BACK_HREF)
        }
        if (services.length > 0 && !serviceToEdit) {
            setIsFetching(false)
        }
    }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps


    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        if (!user) {
            toast.error("Debes iniciar sesión para subir imágenes")
            return
        }

        setIsUploading(true)
        const newImages: string[] = []

        try {
            for (const file of Array.from(files)) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

                const { error } = await supabase.storage
                    .from('service-images')
                    .upload(fileName, file)

                if (error) throw error

                const { data: { publicUrl } } = supabase.storage
                    .from('service-images')
                    .getPublicUrl(fileName)

                newImages.push(publicUrl)
            }

            setImages(prev => [...prev, ...newImages])
            toast.success(`${newImages.length} imagen(es) subida(s)`)

        } catch (error: any) {
            console.error(error)
            toast.error("Error al subir imagen(es)", { description: error.message })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const updates = {
                title,
                category,
                type,
                price: parseFloat(price),
                description,
                location,
                image: images[0] || "",
                gallery: images,
            }

            await updateService(params.id, updates)

            toast.success("Servicio Actualizado", {
                description: "Los cambios se han guardado correctamente.",
            })

            router.push(BACK_HREF)
        } catch (error: any) {
            console.error(error)
            toast.error("Error al actualizar", {
                description: error.message || "Inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching && getMyServices().length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#0052D4" }} />
            </div>
        )
    }

    return (
        <div
            className="min-h-screen py-8 px-4"
            style={{ background: "#0F1216" }}
        >
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={BACK_HREF}>
                        <button
                            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all"
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.10)",
                            }}
                        >
                            <ChevronLeft className="h-4 w-4 text-white" />
                        </button>
                    </Link>
                    <div>
                        <h2 className="ls-title text-2xl">Editar Servicio</h2>
                        <p className="text-white/50 font-inter text-sm">Modifica los detalles de tu publicación.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Main card */}
                    <div className="ls-glass p-6 space-y-6">
                        <h3 className="ls-title text-sm pb-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            Detalles del Servicio
                        </h3>

                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-white/60 font-inter text-xs uppercase tracking-wider">
                                Título del Servicio
                            </label>
                            <input
                                className="ls-input"
                                placeholder="Ej. Paquete de Boda Premium"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Category + Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-white/60 font-inter text-xs uppercase tracking-wider">
                                    Categoría
                                </label>
                                <Select required onValueChange={setCategory} value={category}>
                                    <SelectTrigger
                                        className="ls-input h-auto cursor-pointer"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.10)",
                                            color: "rgba(255,255,255,0.85)",
                                            backdropFilter: "blur(12px)",
                                        }}
                                    >
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent
                                        style={{
                                            background: "#1A1F25",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                        }}
                                    >
                                        {["Locales", "Banquetes", "Música", "Foto y Video", "Decoración"].map(cat => (
                                            <SelectItem
                                                key={cat}
                                                value={cat}
                                                className="text-white/80 focus:bg-white/10 focus:text-white"
                                            >
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-white/60 font-inter text-xs uppercase tracking-wider">
                                    Tipo de Publicación
                                </label>
                                <Select value={type} onValueChange={(v: "service" | "package") => setType(v)}>
                                    <SelectTrigger
                                        className="ls-input h-auto cursor-pointer"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.10)",
                                            color: "rgba(255,255,255,0.85)",
                                            backdropFilter: "blur(12px)",
                                        }}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent
                                        style={{
                                            background: "#1A1F25",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                        }}
                                    >
                                        <SelectItem value="service" className="text-white/80 focus:bg-white/10 focus:text-white">
                                            Servicio Individual
                                        </SelectItem>
                                        <SelectItem value="package" className="text-white/80 focus:bg-white/10 focus:text-white">
                                            Paquete Completo
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-1.5">
                            <label className="text-white/60 font-inter text-xs uppercase tracking-wider">
                                Precio Base (MXN)
                            </label>
                            <div className="relative">
                                <span
                                    className="absolute left-3 top-1/2 -translate-y-1/2 font-outfit font-bold"
                                    style={{ color: "#98FF00" }}
                                >
                                    $
                                </span>
                                <input
                                    type="number"
                                    className="ls-input pl-8"
                                    placeholder="0.00"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-white/60 font-inter text-xs uppercase tracking-wider">
                                Descripción
                            </label>
                            <textarea
                                className="ls-input min-h-[140px] resize-none"
                                placeholder="Describe detalladamente qué incluye tu servicio..."
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-3">
                            <label className="text-white/60 font-inter text-xs uppercase tracking-wider">
                                Imágenes
                            </label>
                            <div
                                className={`rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${isUploading ? "cursor-wait opacity-60" : "hover:border-white/25 hover:bg-white/[0.02]"}`}
                                style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {isUploading ? (
                                    <Loader2 className="h-9 w-9 animate-spin mb-3" style={{ color: "#0052D4" }} />
                                ) : (
                                    <span
                                        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
                                        style={{ background: "rgba(0,82,212,0.12)" }}
                                    >
                                        <Upload className="h-7 w-7" style={{ color: "#0052D4" }} />
                                    </span>
                                )}
                                <p className="text-white font-outfit font-semibold text-sm">
                                    {isUploading ? "Subiendo imágenes..." : "Click para subir imágenes"}
                                </p>
                                <p className="text-white/35 font-inter text-xs mt-1">
                                    {isUploading ? "Por favor espere" : "JPG, PNG, WebP — arrastra y suelta aquí"}
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </div>

                            {images.length > 0 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="relative aspect-square rounded-xl overflow-hidden group"
                                            style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                                        >
                                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(idx) }}
                                                className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ background: "rgba(239,68,68,0.85)" }}
                                            >
                                                <X className="h-3 w-3 text-white" />
                                            </button>
                                            {idx === 0 && (
                                                <span
                                                    className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-outfit font-bold"
                                                    style={{
                                                        background: "rgba(152,255,0,0.20)",
                                                        border: "1px solid rgba(152,255,0,0.40)",
                                                        color: "#98FF00",
                                                    }}
                                                >
                                                    Principal
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <label className="text-white/60 font-inter text-xs uppercase tracking-wider">
                                Ubicación / Cobertura
                            </label>
                            <input
                                className="ls-input"
                                placeholder="Ej. CDMX y Área Metropolitana"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex justify-end gap-3">
                        <Link href={BACK_HREF}>
                            <button type="button" className="ls-btn-ghost">
                                Cancelar
                            </button>
                        </Link>
                        <button
                            type="submit"
                            className="ls-btn-cta"
                            disabled={isLoading || isUploading}
                            style={{ opacity: (isLoading || isUploading) ? 0.6 : 1 }}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
