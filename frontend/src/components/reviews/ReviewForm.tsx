"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"

interface ReviewFormProps {
    bookingId: number | string
    onReviewSubmitted?: () => void
}

export default function ReviewForm({ bookingId, onReviewSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")
    const supabase = createClient()

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Por favor selecciona una calificación")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            const response = await fetch(`${backendUrl}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    rating,
                    comment: comment.trim() || null
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al enviar reseña")
            }

            setSubmitted(true)
            onReviewSubmitted?.()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-semibold text-green-700 dark:text-green-400">¡Gracias por tu reseña!</p>
                <p className="text-sm text-muted-foreground mt-1">Tu opinión ayuda a otros clientes.</p>
            </div>
        )
    }

    return (
        <Card className="border-primary/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">¿Cómo fue tu experiencia?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Estrellas */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="transition-transform hover:scale-110 focus:outline-none"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`h-8 w-8 transition-colors ${star <= (hoveredRating || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-3 text-sm text-muted-foreground">
                        {rating === 1 && "Malo"}
                        {rating === 2 && "Regular"}
                        {rating === 3 && "Bueno"}
                        {rating === 4 && "Muy bueno"}
                        {rating === 5 && "Excelente"}
                    </span>
                </div>

                {/* Comentario */}
                <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Cuéntanos sobre tu experiencia... (opcional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                />
                <div className="text-xs text-right text-muted-foreground">{comment.length}/500</div>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                >
                    {isSubmitting ? "Enviando..." : "Publicar Reseña"}
                </Button>
            </CardContent>
        </Card>
    )
}
