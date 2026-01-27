"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useProvider } from "@/context/provider-context"
import { useAuth } from "@/context/auth-context"

export default function ServicesPage() {
    const { getMyServices, deleteService } = useProvider()
    const myServices = getMyServices()

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mis Servicios</h2>
                    <p className="text-muted-foreground">Administra tu catálogo de servicios y paquetes.</p>
                </div>
                <Link href="/dashboard/provider/services/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Servicio
                    </Button>
                </Link>
            </div>

            {/* Filters and Search - Visual Only for now */}

            {/* Filters and Search - Visual Only for now */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar servicios..." className="pl-9 bg-white" />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                </Button>
            </div>

            {myServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-lg bg-white">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No tienes servicios publicados</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm text-center">
                        Comienza a agregar los servicios que ofreces para que los clientes puedan encontrarte.
                    </p>
                    <Link href="/dashboard/provider/services/new" className="mt-4">
                        <Button>Crear Primer Servicio</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myServices.map((service) => (
                        <Card key={service.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="h-48 w-full bg-muted relative">
                                {service.image ? (
                                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin Imagen</div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={service.type === 'package' ? "default" : "secondary"} className="shadow-sm">
                                        {service.type === 'package' ? 'Paquete' : 'Servicio'}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">{service.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="py-2">
                                <div className="font-bold text-xl text-primary">
                                    ${service.price.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {service.location}
                                </div>
                            </CardContent>
                            <CardFooter className="mt-auto border-t bg-slate-50/50 p-4 flex gap-2">
                                <Link href={`/dashboard/provider/services/${service.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full">Editar</Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de eliminar este servicio?')) {
                                            deleteService(service.id)
                                        }
                                    }}
                                >
                                    <span className="sr-only">Eliminar</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
