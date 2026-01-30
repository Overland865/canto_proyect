"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"

export default function AdminProvidersPage() {
    const [providers, setProviders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const supabase = createClient()

    useEffect(() => {
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
            // We do this separately to avoid complex joins if relations aren't perfect
            const { data: providerDetails, error: detailsError } = await supabase
                .from('provider_profiles')
                .select('*')

            // Map business names to profiles
            const businessMap = new Map()
            if (providerDetails) {
                providerDetails.forEach((d: any) => {
                    businessMap.set(d.id, d.business_name)
                })
            }

            const mergedProviders = profiles.map((p: any) => ({
                ...p,
                businessName: businessMap.get(p.id) || "N/A"
            }))

            setProviders(mergedProviders)

        } catch (err) {
            console.error("Error fetching providers:", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredProviders = providers.filter(provider => {
        const searchLower = searchTerm.toLowerCase()
        const name = provider.full_name?.toLowerCase() || ""
        const email = provider.email?.toLowerCase() || ""
        const business = provider.businessName?.toLowerCase() || ""

        return name.includes(searchLower) || email.includes(searchLower) || business.includes(searchLower)
    })

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Administración de Proveedores</h2>
                    <p className="text-muted-foreground">Vista general de todos los proveedores registrados ({providers.length})</p>
                </div>
                <Button variant="outline" onClick={() => fetchProviders()}>
                    Recargar Lista
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado Global</CardTitle>
                    <CardDescription>
                        Visualizando {filteredProviders.length} proveedores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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

                    <div className="rounded-md border overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nombre</th>
                                    <th scope="col" className="px-6 py-3">Negocio</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">ID</th>
                                    <th scope="col" className="px-6 py-3">Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProviders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">
                                            No se encontraron resultados.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProviders.map((provider) => (
                                        <tr key={provider.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {provider.full_name || "Sin nombre"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {provider.businessName}
                                            </td>
                                            <td className="px-6 py-4">
                                                {provider.email}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {provider.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : "-"}
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
    )
}
