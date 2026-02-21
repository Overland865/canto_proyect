"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ServicesTabProps {
    services: any[]
    onDelete: (id: string) => void
}

export function ServicesTab({ services, onDelete }: ServicesTabProps) {
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
                <Card key={service.id}>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                            <Badge variant={service.type === 'package' ? "default" : "secondary"}>
                                {service.type === 'package' ? 'Paquete' : 'Servicio'}
                            </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-muted rounded-md mb-2 overflow-hidden">
                            {service.image ? (
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sin Imagen</div>
                            )}
                        </div>
                        <p className="font-bold text-lg">${service.price.toLocaleString()}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link href={`/dashboard/provider/services/${service.id}`}>
                            <Button variant="ghost">Editar</Button>
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
