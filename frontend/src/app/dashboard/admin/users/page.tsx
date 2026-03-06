"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, UserX, User, Eye, Search, Loader2, Calendar } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
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

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
    pending: { label: "Pendiente", badgeClass: "bg-yellow-500 text-white" },
    confirmed: { label: "Confirmada", badgeClass: "bg-green-600 text-white" },
    cancelled: { label: "Cancelada", badgeClass: "bg-red-600 text-white" },
    cancellation_requested: { label: "Cancelación Solicitada", badgeClass: "bg-orange-500 text-white" },
    rejected: { label: "Rechazada", badgeClass: "bg-red-500 text-white" },
    completed: { label: "Completado", badgeClass: "bg-purple-600 text-white" },
    rescheduled: { label: "Reprogramación", badgeClass: "border-orange-500 text-orange-500 bg-transparent" },
    finalizado: { label: "Finalizado", badgeClass: "bg-slate-600 text-white" },
}

export default function AdminUsersPage() {
    const supabase = createClient()
    const pathname = usePathname()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    // Details Sheet State
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [userBookings, setUserBookings] = useState<any[]>([])
    const [loadingBookings, setLoadingBookings] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [pathname])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            // Fetch only profiles with role 'consumer'
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'consumer')
                .order('created_at', { ascending: false })

            if (error) {
                console.error(error)
                toast.error("Error al cargar usuarios")
            } else if (data) {
                setUsers(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = async (user: any) => {
        setSelectedUser(user)
        setIsSheetOpen(true)

        try {
            // Refetch to ensure fresh data
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!error && data) {
                setSelectedUser(data)
                setUsers(prev => prev.map(u => u.id === user.id ? data : u))
            }

            // Fetch bookings for this user
            setLoadingBookings(true)
            const { data: bData, error: bError } = await supabase
                .from('bookings')
                .select('*, services(title)')
                .eq('client_id', user.id)
                .order('created_at', { ascending: false })

            if (!bError && bData) {
                setUserBookings(bData)
            } else {
                setUserBookings([])
            }
            setLoadingBookings(false)

        } catch (err) {
            console.error("Error fetching fresh user data", err)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        setProcessing(userId)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("No estás autenticado");
                return;
            }

            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

            // Assuming delete route can handle regular users via same or similar endpoint
            const response = await fetch(`${backendUrl}/api/admin/delete-provider`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ providerId: userId })
            });

            if (!response.ok) {
                // For CORS fallbacks
                const secondTry = await fetch(`${backendUrl}/admin/delete-provider`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({ providerId: userId })
                });

                if (!secondTry.ok) {
                    const errorData = await secondTry.json();
                    throw new Error(errorData.error || "No se pudo eliminar el usuario");
                }
            }

            toast.success("Usuario eliminado completamente");
            setUsers(prev => prev.filter(u => u.id !== userId));
            setIsSheetOpen(false);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Ocurrió un error al eliminar");
        } finally {
            setProcessing(null)
        }
    }

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
                        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text pb-1">Usuarios Registrados</h2>
                    </div>
                    <p className="text-slate-400 ml-12">Listado de clientes creados en la plataforma.</p>
                </div>
                <Button variant="outline" onClick={() => fetchUsers()} className="border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white bg-[#1a103c]/40 text-indigo-300">
                    <Search className="mr-2 h-4 w-4" /> Recargar Lista
                </Button>
            </div>

            {/* User Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="p-0 overflow-y-auto sm:max-w-md w-full gap-0 border-l border-l-purple-500/30 bg-[#0f0920] text-slate-200 shadow-2xl shadow-indigo-900/20">
                    <SheetTitle className="sr-only">Detalles del Usuario</SheetTitle>
                    {selectedUser && (
                        <div className="flex flex-col h-full">
                            {/* Hero / Cover (Using default gradient since users don't have cover images) */}
                            <div className="h-32 bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 relative shrink-0 border-b border-indigo-500/20">
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
                                            {selectedUser.avatar_url ? (
                                                <img src={selectedUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-10 w-10 text-slate-500" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-1">
                                        <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                            Cliente
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-6 pb-10">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight text-white">{selectedUser.full_name || 'Usuario sin nombre'}</h2>
                                        <p className="text-base text-slate-400">{selectedUser.email}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg border-b border-indigo-500/20 pb-2 text-indigo-300">Información de Cuenta</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                            <div>
                                                <p className="text-slate-400 mb-1">ID de Usuario</p>
                                                <p className="font-medium text-slate-200 truncate" title={selectedUser.id}>{selectedUser.id.substring(0, 8)}...</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 mb-1">Fecha de Registro</p>
                                                <p className="font-medium text-slate-200">
                                                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'Desconocida'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-6">
                                        <h3 className="font-semibold text-lg border-b border-indigo-500/20 pb-2 flex items-center gap-2 text-indigo-300">
                                            <Calendar className="w-5 h-5 text-indigo-400" /> Historial de Compras
                                        </h3>
                                        <div className="mt-4">
                                            {loadingBookings ? (
                                                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-indigo-500/50" /></div>
                                            ) : userBookings.length === 0 ? (
                                                <p className="text-sm border border-indigo-500/20 bg-[#1a103c]/20 text-slate-400 text-center py-4 rounded-lg">Este usuario no ha consumido ningún servicio todavía.</p>
                                            ) : (
                                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {userBookings.map((booking) => {
                                                        const statusCfg = STATUS_CONFIG[booking.status] || { label: booking.status, badgeClass: "bg-slate-800 text-slate-300 border border-slate-700" }
                                                        return (
                                                            <div key={booking.id} className="text-sm border border-indigo-500/20 rounded-lg p-3 bg-[#1a103c]/50 shadow-sm flex flex-col gap-2">
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <p className="font-medium text-slate-200 line-clamp-2">{booking.services?.title || "Servicio Desconocido"}</p>
                                                                    <Badge className={`shrink-0 text-xs ${statusCfg.badgeClass}`}>
                                                                        {statusCfg.label}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between text-slate-400">
                                                                    <span>Fecha: {booking.date}</span>
                                                                    <span className="font-medium text-[#98FF00] drop-shadow-[0_0_8px_rgba(152,255,0,0.5)]">${(booking.total_price || 0).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-indigo-500/20 mt-8">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border-0 shadow-lg shadow-red-900/20" disabled={processing === selectedUser.id}>
                                                    <UserX className="w-4 h-4 mr-2" />
                                                    {processing === selectedUser.id ? "Eliminando..." : "Eliminar Cuenta de Cliente"}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-[#1a103c] border-purple-500/30 text-white">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-white">¿Eliminar este cliente?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-slate-400">
                                                        Esta acción eliminará de forma permanente al usuario <b className="text-slate-200">{selectedUser.email}</b> del sistema de autenticación de clientes. No se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteUser(selectedUser.id)} className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90">
                                                        Sí, Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10">
                <CardHeader>
                    <CardTitle className="text-indigo-300">Clientes ({users.length})</CardTitle>
                    <CardDescription className="text-slate-400">
                        Todos los usuarios registrados en CantoProject como clientes regulares.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-indigo-500/20 bg-[#0f0920]/50 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-indigo-950/40 text-indigo-300 border-b border-indigo-500/20">
                                <TableRow className="hover:bg-transparent border-0 border-b border-indigo-500/20">
                                    <TableHead className="font-medium text-indigo-300">Usuario</TableHead>
                                    <TableHead className="font-medium text-indigo-300">Email</TableHead>
                                    <TableHead className="font-medium text-indigo-300">Registro</TableHead>
                                    <TableHead className="font-medium text-indigo-300">Rol</TableHead>
                                    <TableHead className="text-right font-medium text-indigo-300">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow className="border-0">
                                        <TableCell colSpan={5} className="text-center h-24">
                                            <div className="flex justify-center items-center gap-2 text-indigo-400">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow className="border-0">
                                        <TableCell colSpan={5} className="text-center h-24 text-slate-400">
                                            No se encontraron clientes registrados en la plataforma.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="border-b border-indigo-500/10 hover:bg-indigo-500/5 transition-colors text-slate-200">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 relative rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                        {user.avatar_url ? (
                                                            <img src={user.avatar_url} alt="Profile" className="object-cover w-full h-full" />
                                                        ) : (
                                                            <User className="h-5 w-5 text-slate-500" />
                                                        )}
                                                    </div>
                                                    <div
                                                        className="font-medium text-white cursor-pointer hover:text-indigo-300 transition-colors"
                                                        onClick={() => handleViewDetails(user)}
                                                    >
                                                        {user.full_name || 'Sin nombre'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">{user.email}</TableCell>
                                            <TableCell className="text-slate-300">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                                    Cliente
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(user)} className="text-indigo-300 hover:text-white hover:bg-indigo-500/20">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                                                disabled={processing === user.id}
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-[#1a103c] border-purple-500/30 text-white">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">¿Eliminar cliente?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-400">
                                                                    Se eliminará la cuenta y datos de <b>{user.email}</b>. Esta acción es permanente.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
