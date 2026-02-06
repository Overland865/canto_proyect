"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentCancelPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                        Pago Cancelado
                    </CardTitle>
                    <p className="text-muted-foreground">
                        No se realizó ningún cargo a tu tarjeta
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-3">
                        <p className="text-sm text-center text-muted-foreground">
                            Cancelaste el proceso de pago. Tu reserva no fue confirmada.
                        </p>
                        <p className="text-sm text-center">
                            Si tuviste algún problema, puedes intentar nuevamente o contactarnos para ayudarte.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full"
                            onClick={() => router.push('/marketplace')}
                        >
                            Volver al Marketplace
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.back()}
                        >
                            Reintentar Pago
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
