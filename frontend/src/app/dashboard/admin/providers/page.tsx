"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Loader2, Trash2, LogOut, Eye, User, Phone, Globe, Facebook, Instagram } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function AdminProvidersPage() {
    const { logout } = useAuth()
    const [providers, setProviders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [processing, setProcessing] = useState<string | null>(null)

    // Details Sheet State
    const [selectedProvider, setSelectedProvider] = useState<any | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [providerServices, setProviderServices] = useState<any[]>([])
    const [detailsLoading, setDetailsLoading] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        // Ensure data is fetched on mount
        fetchProviders()
    }, [])

    const fetchProviders = async () => {
        setLoading(true)
        try {
            console.log("Fetching all providers...")

            // 1. Fetch profiles with role 'provider'
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'provider')
                .order('created_at', { ascending: false })

            if (profilesError) throw profilesError

            // 2. Fetch provider business details
            const { data: providerDetails, error: detailsError } = await supabase
                .from('provider_profiles')
                .select('*')

            // Map business names to profiles
            const businessMap = new Map()
            const detailsMap = new Map()

            if (providerDetails) {
                providerDetails.forEach((d: any) => {
                    businessMap.set(d.id, d.business_name)
                    detailsMap.set(d.id, d)
                })
            }

            const mergedProviders = profiles.map((p: any) => ({
                ...p,
                businessName: businessMap.get(p.id) || "N/A",
                details: detailsMap.get(p.id) || {},
                status: detailsMap.get(p.id)?.status || 'pending'
            }))

            setProviders(mergedProviders)

        } catch (err) {
            console.error("Error fetching providers:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = async (provider: any) => {
        setSelectedProvider(provider)
        setIsSheetOpen(true)
        setDetailsLoading(true)
        setProviderServices([]) // Reset previous services

        try {
            // Fetch services for this provider
            const { data: services, error } = await supabase
                .from('services')
                .select('*')
                .eq('provider_id', provider.id)

            if (error) throw error
            setProviderServices(services || [])

        } catch (error) {
            console.error("Error fetching services:", error)
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            console.log("Logging out...")
            await logout()
            // Force reload if redirection doesn't happen automatically
            // window.location.href = "/login" 
        } catch (error) {
            console.error("Logout failed:", error)
            // Even if it fails, try to redirect
            window.location.href = "/login"
        }
    }

    const handleApprove = async (id: string, email: string) => {
        setProcessing(id)
        try {
            // Update provider_profiles status
            const { error } = await supabase
                .from('provider_profiles')
                .update({ status: 'approved' })
                .eq('id', id)

            if (error) throw error

            setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p))

            // Optional: Send email notification (backend logic usually)

        } catch (error) {
            console.error("Error approving provider:", error)
            alert("Error al aprobar proveedor")
        } finally {
            setProcessing(null)
        }
    }

    const handleDelete = async (id: string) => {
        setProcessing(id)
        try {
            console.log("Starting deletion for provider:", id)

            // Call backend API to delete provider and all related data
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
            const response = await fetch(`${backendUrl}/admin/delete-provider`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providerId: id })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Error al eliminar proveedor')
            }

            console.log("Provider deleted successfully:", data)

            // Update UI
            setProviders(prev => prev.filter(p => p.id !== id))
            alert(`Proveedor eliminado correctamente. Se eliminaron ${data.deletedServices || 0} servicios asociados.`)

        } catch (error: any) {
            console.error("Error deleting provider:", error)
            alert(`Error al eliminar proveedor: ${error.message || "Error desconocido"}`)
        } finally {
            setProcessing(null)
        }
    }

    const filteredProviders = providers.filter(provider => {
        const searchLower = searchTerm.toLowerCase()
        const name = provider.full_name?.toLowerCase() || ""
        const email = provider.email?.toLowerCase() || ""
        const business = provider.businessName?.toLowerCase() || ""
        return name.includes(searchLower) || email.includes(searchLower) || business.includes(searchLower)
    })

    const pendingProviders = filteredProviders.filter(p => p.status === 'pending')
    const activeProviders = filteredProviders.filter(p => p.status === 'approved')

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Administración de Proveedores</h2>
                    <p className="text-muted-foreground">Gestiona las solicitudes y proveedores activos</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchProviders()}>
                        <Search className="mr-2 h-4 w-4" /> Recargar Lista
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </Button>
                </div>
            </div>

            <div className="flex items-center mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, info..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="p-0 overflow-y-auto sm:max-w-xl w-full gap-0 border-l-0">
                    <SheetTitle className="sr-only">Detalles del Proveedor</SheetTitle>
                    {selectedProvider && (
                        <div className="flex flex-col h-full">
                            {/* Hero / Cover */}
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20"
                                    onClick={() => setIsSheetOpen(false)}
                                >
                                    <Trash2 className="h-0 w-0" /> {/* Hack to hide default close if needed, but SheetContent has a close button usually. We can rely on default or add our own absolute close */}
                                    <span className="sr-only">Close</span>
                                </Button>
                            </div>

                            <div className="px-6 relative flex-1">
                                {/* Profile Image & Header */}
                                <div className="flex justify-between items-end -mt-12 mb-6">
                                    <div className="h-24 w-24 rounded-xl bg-white p-1 shadow-lg">
                                        <div className="h-full w-full rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border">
                                            {selectedProvider.details.logo_url ? (
                                                <img src={selectedProvider.details.logo_url} alt="Logo" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-10 w-10 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-1">
                                        <Badge variant={selectedProvider.status === 'approved' ? 'default' : 'secondary'} className={selectedProvider.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500'}>
                                            {selectedProvider.status === 'approved' ? 'Activo' : 'Pendiente'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-6 pb-10">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight">{selectedProvider.businessName}</h2>
                                        <p className="text-base text-muted-foreground">{selectedProvider.details.category || 'Servicios Profesionales'}</p>

                                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-md">
                                                <User className="h-4 w-4 text-primary" />
                                                <span>{selectedProvider.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-md">
                                                <span className="text-primary font-bold">@</span>
                                                <span className="truncate max-w-[200px]">{selectedProvider.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedProvider.details.phone && (
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Teléfono</p>
                                                    <p className="text-sm font-medium">{selectedProvider.details.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProvider.details.website_url && (
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs text-muted-foreground">Sitio Web</p>
                                                    <a href={selectedProvider.details.website_url} target="_blank" className="text-sm font-medium hover:underline truncate block">
                                                        {selectedProvider.details.website_url.replace(/^https?:\/\//, '')}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-span-full flex gap-2">
                                            {selectedProvider.details.instagram_url && (
                                                <a href={selectedProvider.details.instagram_url} target="_blank" className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors text-sm font-medium text-slate-600">
                                                    <Instagram className="h-4 w-4" /> Instagram
                                                </a>
                                            )}
                                            {selectedProvider.details.facebook_url && (
                                                <a href={selectedProvider.details.facebook_url} target="_blank" className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors text-sm font-medium text-slate-600">
                                                    <Facebook className="h-4 w-4" /> Facebook
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg border-b pb-2">Acerca del Negocio</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {selectedProvider.description || selectedProvider.details.description || "Sin descripción proporcionada."}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg">Servicios y Paquetes</h3>
                                            <Badge variant="outline">{providerServices.length}</Badge>
                                        </div>

                                        {detailsLoading ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8 text-primary/50" /></div>
                                        ) : providerServices.length === 0 ? (
                                            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg bg-slate-50">
                                                <p className="text-sm text-muted-foreground">Este proveedor aún no ha registrado servicios.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {providerServices.map((service: any) => (
                                                    <Card key={service.id} className="overflow-hidden hover:shadow-md transition-all border-slate-200">
                                                        <div className="flex h-24">
                                                            <div className="w-24 shrink-0 bg-slate-100 relative">
                                                                {service.image_url ? (
                                                                    <img src={service.image_url} alt={service.title} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <span className="text-xs text-slate-400">Sin img</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 p-3 flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <h4 className="font-semibold text-sm line-clamp-1">{service.title}</h4>
                                                                        <span className="font-bold text-sm text-primary shrink-0">${service.price}</span>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{service.description}</p>
                                                                </div>
                                                                <div className="flex gap-2 mt-1">
                                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                                                        {service.category || 'Servicio'}
                                                                    </Badge>
                                                                    {service.duration && (
                                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-slate-200">
                                                                            {service.duration} min
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <div className="grid gap-6">
                {/* Pending Section */}
                {pendingProviders.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-950/10">
                        <CardHeader>
                            <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                                <Loader2 className="h-5 w-5" /> Solicitudes Pendientes ({pendingProviders.length})
                            </CardTitle>
                            <CardDescription>
                                Estos proveedores requieren tu aprobación para acceder a la plataforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border bg-white dark:bg-slate-950 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">Nombre / Negocio</th>
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Fecha Solicitud</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingProviders.map((provider) => (
                                            <tr key={provider.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white cursor-pointer hover:underline" onClick={() => handleViewDetails(provider)}>
                                                        {provider.businessName}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{provider.full_name}</div>
                                                </td>
                                                <td className="px-6 py-4">{provider.email}</td>
                                                <td className="px-6 py-4">
                                                    {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleViewDetails(provider)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(provider.id, provider.email)}
                                                        disabled={processing === provider.id}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        {processing === provider.id ? "..." : "Aprobar"}
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="destructive" disabled={processing === provider.id}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta del proveedor y todos sus datos asociados.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(provider.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Active Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Proveedores Activos ({activeProviders.length})</CardTitle>
                        <CardDescription>
                            Proveedores con acceso habilitado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre</th>
                                        <th scope="col" className="px-6 py-3">Negocio</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3">Registro</th>
                                        <th scope="col" className="px-6 py-3">Estado</th>
                                        <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : activeProviders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                                                No hay proveedores activos.
                                            </td>
                                        </tr>
                                    ) : (
                                        activeProviders.map((provider) => (
                                            <tr key={provider.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white cursor-pointer hover:underline" onClick={() => handleViewDetails(provider)}>
                                                    {provider.full_name || "Sin nombre"}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={() => handleViewDetails(provider)}>
                                                    {provider.businessName}
                                                </td>
                                                <td className="px-6 py-4">{provider.email}</td>
                                                <td className="px-6 py-4">
                                                    {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                                                        Activo
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="hover:bg-blue-50 text-blue-600" onClick={() => handleViewDetails(provider)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" disabled={processing === provider.id}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Se eliminará el acceso y datos de <b>{provider.businessName || provider.email}</b>.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(provider.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
