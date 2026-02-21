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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

const CANCELLATION_REASONS = [
    "Cambio de planes",
    "Encontré otro proveedor",
    "Problemas de presupuesto",
    "Cambio de fecha del evento",
    "Error en la reserva",
    "Otro motivo",
]

interface CancellationModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (reason: string) => Promise<void>
    serviceName?: string
}

export default function CancellationModal({
    open,
    onClose,
    onConfirm,
    serviceName,
}: CancellationModalProps) {
    const [selectedReason, setSelectedReason] = useState("")
    const [customReason, setCustomReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const finalReason =
        selectedReason === "Otro motivo"
            ? customReason.trim()
            : selectedReason

    const canSubmit = finalReason.length > 0 && !isSubmitting

    const handleSubmit = async () => {
        if (!canSubmit) return
        setIsSubmitting(true)
        try {
            await onConfirm(finalReason)
            // Reset state on success
            setSelectedReason("")
            setCustomReason("")
            onClose()
        } catch (error) {
            console.error("Error requesting cancellation:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedReason("")
            setCustomReason("")
            onClose()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Solicitar Cancelación
                    </DialogTitle>
                    <DialogDescription>
                        {serviceName
                            ? `¿Estás seguro de que deseas cancelar tu reserva de "${serviceName}"?`
                            : "¿Estás seguro de que deseas cancelar esta reserva?"}
                        {" "}El proveedor deberá aprobar la cancelación.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Selecciona un motivo:
                        </Label>
                        <div className="grid gap-2">
                            {CANCELLATION_REASONS.map((reason) => (
                                <button
                                    key={reason}
                                    type="button"
                                    onClick={() => setSelectedReason(reason)}
                                    className={`text-left px-3 py-2 rounded-md border text-sm transition-colors ${selectedReason === reason
                                            ? "border-primary bg-primary/5 text-primary font-medium"
                                            : "border-border hover:border-primary/50 hover:bg-muted"
                                        }`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedReason === "Otro motivo" && (
                        <div className="space-y-2">
                            <Label htmlFor="custom-reason" className="text-sm font-medium">
                                Describe tu motivo:
                            </Label>
                            <Textarea
                                id="custom-reason"
                                placeholder="Escribe el motivo de la cancelación..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Volver
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {isSubmitting ? "Enviando..." : "Solicitar Cancelación"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
