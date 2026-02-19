"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Review {
    id: number
    rating: number
    comment: string | null
    created_at: string
    profiles: {
        full_name: string
        avatar_url: string | null
    }
}

interface ReviewsListProps {
    serviceId: number | string
}

export default function ReviewsList({ serviceId }: ReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [averageRating, setAverageRating] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
                const response = await fetch(`${backendUrl}/reviews/service/${serviceId}`)
                const data = await response.json()

                if (data.success) {
                    setReviews(data.data)
                    setAverageRating(data.averageRating)
                }
            } catch (err) {
                console.error("Error fetching reviews:", err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchReviews()
    }, [serviceId])

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                ))}
            </div>
        )
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-muted rounded-lg" />
                ))}
            </div>
        )
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Star className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">Sin reseñas aún</p>
                <p className="text-sm">Sé el primero en compartir tu experiencia.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Resumen */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                    <div className="text-4xl font-bold">{averageRating}</div>
                    <div className="flex justify-center mt-1">
                        {renderStars(Math.round(averageRating))}
                    </div>
                </div>
                <div className="border-l pl-4">
                    <p className="font-medium">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</p>
                    <div className="space-y-1 mt-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length
                            const percentage = (count / reviews.length) * 100
                            return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="w-3">{star}</span>
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Lista de reseñas */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={review.profiles?.avatar_url || undefined} />
                                <AvatarFallback>
                                    {review.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">{review.profiles?.full_name || 'Anónimo'}</p>
                                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                                </div>
                                <div className="mt-1">{renderStars(review.rating)}</div>
                                {review.comment && (
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
