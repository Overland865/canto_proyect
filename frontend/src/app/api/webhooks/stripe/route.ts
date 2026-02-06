import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        console.error('⚠️ Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Manejar el evento
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                console.log('✅ Payment successful:', session.id)

                // Crear booking en Supabase
                const { error } = await supabase.from('bookings').insert({
                    user_id: session.metadata?.userId,
                    provider_id: session.metadata?.providerId,
                    service_id: session.metadata?.serviceId,
                    date: session.metadata?.date,
                    time: '14:00 - 22:00', // Default
                    status: 'confirmed', // Confirmado porque ya pagó
                    payment_status: 'paid',
                    price: (session.amount_total || 0) / 100,
                    amount_paid: (session.amount_total || 0) / 100,
                    stripe_session_id: session.id,
                    stripe_payment_intent: session.payment_intent as string,
                    paid_at: new Date().toISOString(),
                    guests: 100,
                    specifications: session.metadata?.address || 'Sin especificaciones',
                })

                if (error) {
                    console.error('❌ Error creating booking:', error)
                    // Aquí podrías enviar una alerta o notificación
                } else {
                    console.log('✅ Booking created successfully')
                }
                break
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                console.log('💰 PaymentIntent succeeded:', paymentIntent.id)
                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                console.log('❌ Payment failed:', paymentIntent.id)

                // Actualizar estado si existe el booking
                await supabase
                    .from('bookings')
                    .update({ payment_status: 'failed' })
                    .eq('stripe_payment_intent', paymentIntent.id)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Error processing webhook:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
