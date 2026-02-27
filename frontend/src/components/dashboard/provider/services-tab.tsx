"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useProvider } from "@/context/provider-context"
import { toast } from "sonner"
import Link from "next/link"

interface ServicesTabProps {
    services: any[]
    onDelete: (id: string) => void
}

export function ServicesTab({ services, onDelete }: ServicesTabProps) {
    const { toggleServiceStatus } = useProvider()

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleServiceStatus(id, !currentStatus)
            toast.success(`Servicio ${!currentStatus ? 'activado' : 'pausado'} exitosamente`)
        } catch (error) {
            toast.error("Error al cambiar el estado del servicio")
        }
    }

    if (services.length === 0) {
        return (
            <div className="text-center py-20 border border-dashed rounded-lg bg-muted/50">
                <h3 className="text-lg font-medium text-muted-foreground">No tienes servicios publicados</h3>
                <p className="text-sm text-muted-foreground mt-2">Crea tu primer servicio o paquete para empezar a vender.</p>
                <Link href="/dashboard/provider/services/new">
                    <Button className="mt-4" variant="outline">Crear Servicio</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
                <Card key={service.id} className={`transition-all duration-300 ${!service.is_active ? 'opacity-70 grayscale-[0.3]' : ''}`}>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                                <div className="flex gap-2 items-center mt-2">
                                    <Badge variant={service.type === 'package' ? "default" : "secondary"}>
                                        {service.type === 'package' ? 'Paquete' : 'Servicio'}
                                    </Badge>
                                    {!service.is_active && (
                                        <Badge variant="outline" className="text-muted-foreground bg-muted">Pausado</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Switch
                                    checked={service.is_active ?? true}
                                    onCheckedChange={() => handleToggle(service.id, service.is_active ?? true)}
                                />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                    {service.is_active ? 'Activo' : 'Pausa'}
                                </span>
                            </div>
                        </div>
                        <CardDescription className="line-clamp-2 mt-2">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-muted rounded-md mb-2 overflow-hidden relative">
                            {service.image ? (
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin Imagen</div>
                            )}
                            {!service.is_active && (
                                <div className="absolute inset-0 bg-background/20 flex items-center justify-center backdrop-blur-[1px]">
                                    <Badge variant="secondary" className="font-bold text-sm px-3 shadow-md">No Disponible</Badge>
                                </div>
                            )}
                        </div>
                        <p className={`font-bold text-lg ${!service.is_active ? 'text-muted-foreground' : ''}`}>${service.price.toLocaleString()}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link href={`/dashboard/provider/services/${service.id}`}>
                            <Button variant="ghost" disabled={!service.is_active}>Editar</Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                                if (confirm('¿Estás seguro de eliminar este servicio?')) {
                                    onDelete(service.id)
                                }
                            }}
                        >
                            Eliminar
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
