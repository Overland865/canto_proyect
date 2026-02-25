import { createBrowserClient } from '@supabase/ssr'

const isDev = process.env.NODE_ENV === 'development'
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder').trim()

if (isDev && (supabaseUrl.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    console.error('CRITICAL: Supabase credentials are missing or using placeholders in .env.local')
}

export const createClient = () =>
    createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
