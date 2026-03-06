"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Loader2, Trash2, LogOut, Eye, User, Phone, Globe, Facebook, Instagram, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    const pathname = usePathname()

    useEffect(() => {
        // Ensure data is fetched on mount and on soft navigation
        fetchProviders()
    }, [pathname])

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

            const mergedProviders = profiles.map((p: any) => {
                const details = detailsMap.get(p.id) || {}
                // Fallback logic to show an image if avatar_url is missing (same as public profile)
                const bestImage = p.avatar_url || p.cover_image || (details.gallery_images && details.gallery_images[0]) || null

                return {
                    ...p,
                    businessName: businessMap.get(p.id) || "N/A",
                    details: details,
                    status: p.status || details.status || 'pending',
                    // These come from profiles, kept at top level for easy access in the sheet:
                    avatar_url: bestImage,
                    cover_image: p.cover_image || null,
                }
            })

            setProviders(mergedProviders)

        } catch (err) {
            console.error("Error fetching providers:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = async (provider: any) => {
        // Optimistically set the provider from list data
        setSelectedProvider(provider)
        setIsSheetOpen(true)
        setDetailsLoading(true)
        setProviderServices([])

        try {
            // Refetch the most up-to-date provider profile and details to prevent stale data
            const [profileRes, detailsRes, servicesRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', provider.id).single(),
                supabase.from('provider_profiles').select('*').eq('id', provider.id).single(),
                supabase.from('services').select('id, title, description, price, category, image, gallery, unit, is_active').eq('provider_id', provider.id).eq('is_active', true)
            ])

            if (!profileRes.error) {
                const details = detailsRes.data || {}
                const bestImage = profileRes.data.avatar_url || profileRes.data.cover_image || (details.gallery_images && details.gallery_images[0]) || null

                const refreshedProvider = {
                    ...profileRes.data,
                    businessName: details.business_name || "N/A",
                    details: details,
                    status: profileRes.data.status || details.status || 'pending',
                    avatar_url: bestImage,
                    cover_image: profileRes.data.cover_image || null,
                }
                setSelectedProvider(refreshedProvider)

                // Update the provider in the main list so it matches
                setProviders(prev => prev.map(p => p.id === provider.id ? refreshedProvider : p))
            }

            if (servicesRes.error) console.error('Services error:', servicesRes.error)
            setProviderServices(servicesRes.data || [])

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
            // Update status in the `profiles` table (this is where the status column lives)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ status: 'approved' })
                .eq('id', id)

            if (profileError) throw profileError

            // Also update provider_profiles if it has a status column (safe upsert attempt)
            await supabase
                .from('provider_profiles')
                .update({ status: 'approved' })
                .eq('id', id)
            // ignore errors here — column might not exist

            setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p))

        } catch (error: any) {
            console.error("Error approving provider:", error)
            alert(`Error al aprobar proveedor: ${error.message || 'Error desconocido'}`)
        } finally {
            setProcessing(null)
        }
    }

    const handleDelete = async (id: string) => {
        setProcessing(id)
        try {
            console.log("Starting deletion for provider:", id)

            // Use relative URL — Next.js API route (no hardcoded localhost)
            const response = await fetch(`/api/admin/delete-provider`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerId: id })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Error al eliminar proveedor')
            }

            console.log("Provider deleted successfully:", data)
            setProviders(prev => prev.filter(p => p.id !== id))
            alert(`Proveedor eliminado. Se eliminaron ${data.deletedServices || 0} servicios asociados.`)

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
        <div className="container mx-auto py-10 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/admin">
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-purple-500/30 hover:bg-purple-500/20 hover:text-white bg-[#1a103c]/50 text-slate-300">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text pb-1">Administración de Proveedores</h2>
                    </div>
                    <p className="text-slate-400 ml-12">Gestiona las solicitudes y proveedores activos en la plataforma</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchProviders()} className="border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white bg-[#1a103c]/40 text-indigo-300">
                        <Search className="mr-2 h-4 w-4" /> Recargar Lista
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-0 shadow-lg shadow-red-900/20">
                        <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                    </Button>
                </div>
            </div>

            <div className="flex items-center mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                    <Input
                        placeholder="Buscar por nombre, info..."
                        className="pl-10 bg-[#1a103c]/60 border-purple-500/30 text-white placeholder-slate-400 focus-visible:ring-purple-500 focus-visible:ring-offset-0 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="p-0 overflow-y-auto sm:max-w-xl w-full gap-0 border-l border-l-purple-500/30 bg-[#0f0920] text-slate-200 shadow-2xl shadow-indigo-900/20">
                    <SheetTitle className="sr-only">Detalles del Proveedor</SheetTitle>
                    {selectedProvider && (
                        <div className="flex flex-col h-full">
                            {/* Hero / Cover */}
                            <div className="h-32 bg-indigo-950 relative shrink-0 overflow-hidden border-b border-indigo-500/20">
                                {selectedProvider.cover_image && (
                                    <img
                                        src={selectedProvider.cover_image}
                                        alt="Cover"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 bg-black/20 backdrop-blur-sm"
                                    onClick={() => setIsSheetOpen(false)}
                                >
                                    <span className="sr-only">Close</span>
                                </Button>
                            </div>

                            <div className="px-6 relative flex-1">
                                {/* Profile Image & Header */}
                                <div className="flex justify-between items-end -mt-12 mb-6">
                                    <div className="h-24 w-24 rounded-xl bg-[#1a103c] p-1 shadow-lg shadow-black/50 border border-indigo-500/30">
                                        <div className="h-full w-full rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                                            {selectedProvider.avatar_url ? (
                                                <img src={selectedProvider.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-10 w-10 text-slate-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-1">
                                        <Badge variant={selectedProvider.status === 'approved' ? 'default' : 'secondary'} className={selectedProvider.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'}>
                                            {selectedProvider.status === 'approved' ? 'Activo' : 'Pendiente'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-6 pb-10">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-white">{selectedProvider.businessName}</h2>
                                        <p className="text-base text-slate-400">
                                            {selectedProvider.details.categories?.join(', ') || 'Servicios Profesionales'}
                                        </p>

                                        <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                            <div className="flex items-center gap-2 text-slate-300 bg-[#1a103c]/50 border border-indigo-500/20 px-3 py-1.5 rounded-md shadow-sm">
                                                <User className="h-4 w-4 text-indigo-400" />
                                                <span>{selectedProvider.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-300 bg-[#1a103c]/50 border border-indigo-500/20 px-3 py-1.5 rounded-md shadow-sm">
                                                <span className="text-indigo-400 font-bold">@</span>
                                                <span className="truncate max-w-[200px]">{selectedProvider.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedProvider.details.contact_phone && (
                                            <div className="flex items-center gap-3 p-3 border border-indigo-500/20 bg-[#1a103c]/30 rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Teléfono</p>
                                                    <p className="text-sm font-medium text-slate-200">{selectedProvider.details.contact_phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProvider.details.contact_email && (
                                            <div className="flex items-center gap-3 p-3 border border-indigo-500/20 bg-[#1a103c]/30 rounded-lg">
                                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <span className="font-bold text-sm">@</span>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs text-slate-400">Email negocio</p>
                                                    <p className="text-sm font-medium text-slate-200 truncate">{selectedProvider.details.contact_email}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedProvider.details.contact_website && (
                                            <div className="flex items-center gap-3 p-3 border border-indigo-500/20 bg-[#1a103c]/30 rounded-lg col-span-full">
                                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs text-slate-400">Sitio Web</p>
                                                    <a href={selectedProvider.details.contact_website} target="_blank" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline truncate block">
                                                        {selectedProvider.details.contact_website.replace(/^https?:\/\//, '')}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-span-full flex gap-2">
                                            {selectedProvider.details.social_instagram && (
                                                <a href={selectedProvider.details.social_instagram} target="_blank" className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/20 transition-colors text-sm font-medium text-pink-400">
                                                    <Instagram className="h-4 w-4" /> Instagram
                                                </a>
                                            )}
                                            {selectedProvider.details.social_facebook && (
                                                <a href={selectedProvider.details.social_facebook} target="_blank" className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/20 transition-colors text-sm font-medium text-blue-400">
                                                    <Facebook className="h-4 w-4" /> Facebook
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg border-b border-indigo-500/20 pb-2 text-indigo-300">Acerca del Negocio</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {selectedProvider.description || selectedProvider.details.description || "Sin descripción proporcionada."}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-lg text-indigo-300">Servicios y Paquetes</h3>
                                            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">{providerServices.length}</Badge>
                                        </div>

                                        {detailsLoading ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-500/50" /></div>
                                        ) : providerServices.length === 0 ? (
                                            <div className="text-center py-8 px-4 border-2 border-dashed border-indigo-500/20 rounded-lg bg-[#1a103c]/20">
                                                <p className="text-sm text-slate-400">Este proveedor aún no ha registrado servicios.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {providerServices.map((service: any) => (
                                                    <Card key={service.id} className="overflow-hidden hover:shadow-lg hover:shadow-indigo-900/20 transition-all border-indigo-500/20 bg-[#1a103c]/50">
                                                        <div className="flex h-24">
                                                            <div className="w-24 shrink-0 bg-slate-800 relative border-r border-indigo-500/20">
                                                                {(service.image || (service.gallery && service.gallery[0])) ? (
                                                                    <img src={service.image || service.gallery[0]} alt={service.title} className="h-full w-full object-cover opacity-100" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <span className="text-xs text-slate-500">Sin img</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 p-3 flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex justify-between items-start gap-2">
                                                                        <h4 className="font-semibold text-sm line-clamp-1 text-slate-200">{service.title}</h4>
                                                                        <span className="font-bold text-sm text-[#98FF00] shrink-0 drop-shadow-[0_0_8px_rgba(152,255,0,0.5)]">${Number(service.price || 0).toLocaleString('es-MX')}</span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{service.description}</p>
                                                                </div>
                                                                <div className="flex gap-2 mt-1">
                                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                                        {service.category || 'Servicio'}
                                                                    </Badge>
                                                                    {service.unit && (
                                                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-purple-500/30 text-purple-300 bg-purple-500/10">
                                                                            {service.unit}
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
                    <Card className="border-orange-500/30 bg-[#1a103f]/60 backdrop-blur-xl shadow-lg shadow-orange-900/10">
                        <CardHeader>
                            <CardTitle className="text-orange-400 flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" /> Solicitudes Pendientes ({pendingProviders.length})
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Estos proveedores requieren tu aprobación para acceder a la plataforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-orange-500/20 bg-[#0f0920]/50 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-orange-950/40 text-orange-200/70 border-b border-orange-500/20">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Nombre / Negocio</th>
                                            <th className="px-6 py-3 font-medium">Email</th>
                                            <th className="px-6 py-3 font-medium">Fecha Solicitud</th>
                                            <th className="px-6 py-3 font-medium text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingProviders.map((provider) => (
                                            <tr key={provider.id} className="border-b border-orange-500/10 hover:bg-orange-500/5 transition-colors text-slate-200">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 relative rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                            {provider.avatar_url ? (
                                                                <img src={provider.avatar_url} alt="Profile" className="object-cover w-full h-full" />
                                                            ) : (
                                                                <User className="h-5 w-5 text-slate-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white cursor-pointer hover:text-orange-300 transition-colors" onClick={() => handleViewDetails(provider)}>
                                                                {provider.businessName}
                                                            </div>
                                                            <div className="text-xs text-slate-400">{provider.full_name || "Sin nombre"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{provider.email}</td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10" onClick={() => handleViewDetails(provider)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(provider.id, provider.email)}
                                                        disabled={processing === provider.id}
                                                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-0 shadow-lg shadow-emerald-900/20"
                                                    >
                                                        {processing === provider.id ? "..." : "Aprobar"}
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="destructive" disabled={processing === provider.id} className="bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300 border border-red-500/30">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-[#1a103c] border-purple-500/30 text-white">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta del proveedor y todos sus datos asociados.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(provider.id)} className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
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
                <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10">
                    <CardHeader>
                        <CardTitle className="text-indigo-300">Proveedores Activos ({activeProviders.length})</CardTitle>
                        <CardDescription className="text-slate-400">
                            Proveedores con acceso habilitado en la plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-indigo-500/20 bg-[#0f0920]/50 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-indigo-950/40 text-indigo-200/70 border-b border-indigo-500/20">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium">Nombre</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Negocio</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Email</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Registro</th>
                                        <th scope="col" className="px-6 py-3 font-medium">Estado</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2 text-indigo-400">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : activeProviders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-slate-400">
                                                No hay proveedores activos.
                                            </td>
                                        </tr>
                                    ) : (
                                        activeProviders.map((provider) => (
                                            <tr key={provider.id} className="border-b border-indigo-500/10 hover:bg-indigo-500/5 transition-colors text-slate-200">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 relative rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                            {provider.avatar_url ? (
                                                                <img src={provider.avatar_url} alt="Profile" className="object-cover w-full h-full" />
                                                            ) : (
                                                                <User className="h-5 w-5 text-slate-500" />
                                                            )}
                                                        </div>
                                                        <div className="font-medium text-white whitespace-nowrap cursor-pointer hover:text-indigo-300 transition-colors" onClick={() => handleViewDetails(provider)}>
                                                            {provider.full_name || "Sin nombre"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-indigo-400 cursor-pointer hover:underline" onClick={() => handleViewDetails(provider)}>
                                                    {provider.businessName}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{provider.email}</td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                                                        Activo
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" className="hover:bg-indigo-500/20 text-indigo-300" onClick={() => handleViewDetails(provider)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20 hover:text-red-300" disabled={processing === provider.id}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-[#1a103c] border-purple-500/30 text-white">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">¿Eliminar proveedor?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    Se eliminará el acceso y datos de <b>{provider.businessName || provider.email}</b>.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(provider.id)} className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
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
