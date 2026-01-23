"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ChevronLeft, Upload, Loader2, X } from "lucide-react"
import { useState, useRef, useEffect, use } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useProvider } from "@/context/provider-context"

// Next.js 15+ Params type handling
type Params = Promise<{ id: string }>

export default function EditServicePage(props: { params: Params }) {
    const params = use(props.params)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { getMyServices, updateService } = useProvider()

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
        const loadService = () => {
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
                // Services loaded but id not found
                toast.error("Servicio no encontrado")
                router.push("/dashboard/provider/services")
            }
            // If services.length === 0, contexts might be loading, wait a bit or rely on context isLoading 
            // For now simple check:
            if (services.length > 0 && !serviceToEdit) {
                setIsFetching(false)
            }
        }

        loadService()
        // Retry logic specifically if context is slow could be better handled by context.isLoading
    }, [params.id, getMyServices])


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImages(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })
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
                image: images[0] || "", // Main image
                gallery: images,
            }

            await updateService(params.id, updates)

            toast.success("Servicio Actualizado", {
                description: "Los cambios se han guardado correctamente.",
            })

            router.push("/dashboard/provider/services")
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
        return <div className="p-10 text-center">Cargando datos del servicio...</div>
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/provider/services">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Editar Servicio</h2>
                    <p className="text-muted-foreground">Modifica los detalles de tu publicación.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Servicio</CardTitle>
                        <CardDescription>
                            Actualiza la información de tu servicio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título del Servicio</Label>
                            <Input
                                id="title"
                                placeholder="Ej. Paquete de Boda Premium"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría</Label>
                                <Select required onValueChange={setCategory} value={category}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Locales">Locales</SelectItem>
                                        <SelectItem value="Banquetes">Banquetes</SelectItem>
                                        <SelectItem value="Música">Música</SelectItem>
                                        <SelectItem value="Foto y Video">Foto y Video</SelectItem>
                                        <SelectItem value="Decoración">Decoración</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo de Publicación</Label>
                                <Select value={type} onValueChange={(v: "service" | "package") => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="service">Servicio Individual</SelectItem>
                                        <SelectItem value="package">Paquete Completo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Precio Base ($)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    id="price"
                                    type="number"
                                    className="pl-7"
                                    placeholder="0.00"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe detalladamente qué incluye tu servicio..."
                                className="min-h-[150px]"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Imágenes</Label>
                            <div
                                className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                                <p className="font-semibold">Click para subir imágenes nuevas</p>
                                <p className="text-sm text-muted-foreground">o arrastra y suelta aquí</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                            </div>
                            {images.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-muted group">
                                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación / Cobertura</Label>
                            <Input
                                id="location"
                                placeholder="Ej. CDMX y Área Metropolitana"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t bg-slate-50/50 p-6">
                        <Link href="/dashboard/provider/services">
                            <Button variant="ghost" type="button">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
