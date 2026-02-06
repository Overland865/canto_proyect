import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {
            serviceId,
            providerId,
            serviceName,
            price,
            date,
            address,
            userId,
            userEmail
        } = body

        // Validación
        if (!serviceId || !providerId || !price || !date || !userId) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            )
        }

        // Crear sesión de checkout en Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn', // Cambiar a 'usd' si prefieres dólares
                        product_data: {
                            name: serviceName,
                            description: `Reserva para ${date}${address ? ` - ${address}` : ''}`,
                        },
                        unit_amount: Math.round(price * 100), // Stripe usa centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/payment/cancel`,
            customer_email: userEmail,
            metadata: {
                serviceId,
                providerId,
                userId,
                date,
                address: address || 'N/A',
            },
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: error.message || 'Error al crear sesión de pago' },
            { status: 500 }
        )
    }
}
