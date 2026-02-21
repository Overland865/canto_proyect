"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { analyzeEventGap, findComplementaryProviders } from "@/lib/supabase-service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ComplementaryProvidersProps {
    service: any
    guestCount: number
}

export function ComplementaryProviders({ service, guestCount }: ComplementaryProvidersProps) {
    const supabase = createClient()
    const [gap, setGap] = useState<Record<string, number>>({})
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (service.category !== 'Locales' || !guestCount) return

        const { hasGap, gap: eventGap } = analyzeEventGap(service, guestCount)

        if (hasGap) {
            setGap(eventGap)
            fetchSuggestions(eventGap)
        }
    }, [service, guestCount])

    const fetchSuggestions = async (eventGap: Record<string, number>) => {
        setLoading(true)
        try {
            // If chairs are missing, find furniture providers
            const providers = await findComplementaryProviders(supabase, {
                category: 'Mobiliario',
            })
            setSuggestions(providers)
        } catch (error) {
            console.error("Error fetching complementary providers:", error)
        } finally {
            setLoading(false)
        }
    }

    if (service.category !== 'Locales' || Object.keys(gap).length === 0) return null

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                    <Info className="w-5 h-5" />
                    <CardTitle className="text-md">Sugerencias para tu evento</CardTitle>
                </div>
                <CardDescription>
                    Detectamos que tu evento de {guestCount} personas podría necesitar equipo adicional:
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {gap.chairs && (
                        <Badge variant="outline" className="bg-white">
                            Faltan {gap.chairs} sillas
                        </Badge>
                    )}
                    {gap.tables && (
                        <Badge variant="outline" className="bg-white">
                            Faltan {gap.tables} mesas
                        </Badge>
                    )}
                    {gap.capacity && (
                        <Badge variant="destructive">
                            Supera capacidad por {gap.capacity}
                        </Badge>
                    )}
                </div>

                {suggestions.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <p className="text-sm font-medium">Proveedores recomendados:</p>
                        <div className="grid gap-3">
                            {suggestions.slice(0, 2).map((s) => (
                                <div key={s.id} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted rounded-full overflow-hidden">
                                            {s.image_url ? (
                                                <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs">IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{s.title}</p>
                                            <p className="text-xs text-muted-foreground">{s.profiles?.full_name}</p>
                                        </div>
                                    </div>
                                    <Link href={`/marketplace/${s.id}`}>
                                        <Button size="sm" variant="ghost">
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
