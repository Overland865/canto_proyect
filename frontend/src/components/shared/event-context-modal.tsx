"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, MapPin, Calendar, Clock, Tag } from "lucide-react"

interface EventContext {
    eventName: string
    guests: number
    location: string
    eventTime: string
}

interface EventContextModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (context: EventContext) => void
    serviceName?: string
}

export default function EventContextModal({
    open,
    onClose,
    onConfirm,
    serviceName
}: EventContextModalProps) {
    const [formData, setFormData] = useState<EventContext>({
        eventName: "",
        guests: 10,
        location: "",
        eventTime: "12:00"
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: id === 'guests' ? parseInt(value) || 0 : value
        }))
    }

    const handleConfirm = () => {
        onConfirm(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Detalles de tu Evento</DialogTitle>
                    <DialogDescription>
                        Cuéntanos un poco más sobre el evento para {serviceName || "este servicio"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="eventName" className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" /> Nombre del Evento
                        </Label>
                        <Input
                            id="eventName"
                            placeholder="Ej: Boda de Laura, XV de Sofía..."
                            value={formData.eventName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="guests" className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" /> Invitados
                            </Label>
                            <Input
                                id="guests"
                                type="number"
                                value={formData.guests}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eventTime" className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> Hora
                            </Label>
                            <Input
                                id="eventTime"
                                type="time"
                                value={formData.eventTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" /> Ubicación / Dirección
                        </Label>
                        <Input
                            id="location"
                            placeholder="Calle, Número, Colonia, Ciudad"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm}>Confirmar y Solicitar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
