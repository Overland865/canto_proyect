import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').trim()
    const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').trim()

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname.startsWith('/dashboard')
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Role-based access control and Root redirect
    if (user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/marketplace')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // Redirect providers to their dashboard if they are on "client" pages
        if (profile?.role === 'provider') {
            const isAtProviderDashboard = request.nextUrl.pathname.startsWith('/dashboard/provider')
            const isAtAdminDashboard = request.nextUrl.pathname.startsWith('/dashboard/admin')

            // If a provider lands on root, marketplace, or user dashboard, send them to provider dashboard
            if (!isAtProviderDashboard && !isAtAdminDashboard) {
                return NextResponse.redirect(new URL('/dashboard/provider', request.url))
            }
        }

        // Standard Admin check
        if (
            request.nextUrl.pathname.startsWith('/dashboard/admin') &&
            profile?.role !== 'admin'
        ) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Standard User check (e.g. users shouldn't be in provider dashboard)
        if (
            request.nextUrl.pathname.startsWith('/dashboard/provider') &&
            profile?.role !== 'provider'
        ) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}
