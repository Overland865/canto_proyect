import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function DELETE(request: NextRequest) {
    try {
        const { providerId } = await request.json()

        if (!providerId) {
            return NextResponse.json(
                { error: 'Provider ID is required' },
                { status: 400 }
            )
        }

        console.log('Starting deletion process for provider:', providerId)

        // Step 1: Get all services from this provider
        const { data: services, error: servicesQueryError } = await supabaseAdmin
            .from('services')
            .select('id')
            .eq('provider_id', providerId)

        if (servicesQueryError) {
            console.error('Error querying services:', servicesQueryError)
            throw servicesQueryError
        }

        const serviceIds = services?.map(s => s.id) || []
        console.log('Found services to delete:', serviceIds)

        // Step 2: Delete bookings related to these services
        if (serviceIds.length > 0) {
            const { error: bookingsError } = await supabaseAdmin
                .from('bookings')
                .delete()
                .in('service_id', serviceIds)

            if (bookingsError) {
                console.error('Error deleting bookings:', bookingsError)
                throw bookingsError
            }
            console.log('Deleted bookings for services')
        }

        // Step 3: Delete notifications related to this provider
        const { error: notificationsError } = await supabaseAdmin
            .from('notifications')
            .delete()
            .eq('user_id', providerId)

        if (notificationsError) {
            console.error('Error deleting notifications:', notificationsError)
            // Don't throw, notifications might not exist
        }
        console.log('Deleted notifications')

        // Step 4: Delete all services
        if (serviceIds.length > 0) {
            const { error: servicesDeleteError } = await supabaseAdmin
                .from('services')
                .delete()
                .eq('provider_id', providerId)

            if (servicesDeleteError) {
                console.error('Error deleting services:', servicesDeleteError)
                throw servicesDeleteError
            }
            console.log('Deleted services')
        }

        // Step 5: Delete provider_profiles
        const { error: providerProfileError } = await supabaseAdmin
            .from('provider_profiles')
            .delete()
            .eq('id', providerId)

        if (providerProfileError) {
            console.error('Error deleting provider_profiles:', providerProfileError)
            // Don't throw, might not exist
        }
        console.log('Deleted provider_profiles')

        // Step 6: Delete from profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', providerId)

        if (profileError) {
            console.error('Error deleting profile:', profileError)
            throw profileError
        }
        console.log('Deleted profile')

        // Step 7: Delete from auth.users (requires service role key)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
            providerId
        )

        if (authError) {
            console.error('Error deleting auth user:', authError)
            // This is critical but might fail if user was already deleted
            console.warn('Auth user deletion failed, but continuing...')
        }
        console.log('Deleted auth user')

        return NextResponse.json({
            success: true,
            message: 'Provider deleted successfully',
            deletedServices: serviceIds.length
        })

    } catch (error: any) {
        console.error('Error in delete-provider API:', error)
        return NextResponse.json(
            {
                error: 'Failed to delete provider',
                details: error.message,
                code: error.code
            },
            { status: 500 }
        )
    }
}
