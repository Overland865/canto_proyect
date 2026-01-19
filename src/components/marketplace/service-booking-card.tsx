"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceBookingCardProps {
    price: number
    unit?: string
    category: string
}

export function ServiceBookingCard({ price, unit, category }: ServiceBookingCardProps) {
    const [date, setDate] = useState<Date>()
    const [address, setAddress] = useState("")

    const isLocal = category === "Locales" || category === "Salones"

    const handleQuote = () => {
        if (!date) {
            alert("Por favor selecciona una fecha")
            return
        }
        if (!isLocal && !address) {
            alert("Por favor ingresa la dirección del evento")
            return
        }
        alert("Cotización solicitada con éxito")
    }

    return (
        <Card className="shadow-xl border-primary/10">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Desde ${price.toLocaleString()}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <span className="text-sm font-medium">Fecha del evento</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {!isLocal && (
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium">Dirección del evento</Label>
                        <Input
                            id="address"
                            placeholder="Calle, Número, Colonia..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                )}

                <Button className="w-full" size="lg" onClick={handleQuote}>
                    Solicitar Cotización
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Tu solicitud no es un compromiso de compra directa.
                </p>
            </CardContent>
        </Card>
    )
}
