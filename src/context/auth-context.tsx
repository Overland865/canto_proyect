"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type User = {
    id: string
    name: string
    lastname: string
    email: string
    role: "consumer" | "provider"
    businessName?: string
    region?: string
}

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    login: (params: any) => Promise<void>
    register: (params: any) => Promise<void>
    logout: () => Promise<void>
    updateProfile: (userData: Partial<User>) => void
    authError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [authError, setAuthError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            console.log("Checking session...")
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) {
                console.error("Session error:", error)
                setAuthError("Session Error: " + error.message)
            }
            console.log("Session found:", session ? session.user.id : "No session")
            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email!)
            } else {
                console.warn("No active session found on client.")
            }
        }
        checkSession()

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setAuthError(null) // Clear error on new sign in
                await fetchProfile(session.user.id, session.user.email!)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setAuthError(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const fetchProfile = async (userId: string, email: string) => {
        try {
            setAuthError(null)
            // Fetch basic profile
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) throw error

            // Self-healing: If profile missing (triggers failed), create it
            if (!profile) {
                console.warn("Profile missing for user, attempting creation...")
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        email: email,
                        full_name: email.split('@')[0], // Fallback name
                        role: 'consumer' // Default role
                    })
                    .select()
                    .single()

                if (createError) throw createError
                profile = newProfile
            }

            if (!profile) throw new Error("Could not load or create profile")

            let extendedUser: User = {
                id: userId,
                name: profile.full_name?.split(' ')[0] || '',
                lastname: profile.full_name?.split(' ').slice(1).join(' ') || '',
                email: email,
                role: profile.role,
                region: profile.region,
            }

            // If provider, fetch provider details
            if (profile.role === 'provider') {
                const { data: providerData, error: providerError } = await supabase
                    .from('provider_profiles')
                    .select('business_name')
                    .eq('id', userId)
                    .maybeSingle()

                if (providerError) {
                    console.warn("Error fetching provider profile:", providerError)
                }

                if (providerData) {
                    extendedUser.businessName = providerData.business_name
                }
            }

            setUser(extendedUser)
        } catch (error: any) {
            console.error("Error fetching profile:", error)
            setAuthError("Profile Fetch Error: " + (error.message || JSON.stringify(error)))
            // Do not reset user to null if we want to allow at least partial auth, 
            // but for now, if profile fails, we effectively have no user data.
            // We could set a partial user here if session exists.
            setUser(null)
        }
    }

    const login = async ({ email, password }: any) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            throw error
        }

        toast.success("Bienvenido de nuevo")

        try {
            // Check user role for redirection
            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                if (profile?.role === 'provider') {
                    router.push("/dashboard/provider")
                } else {
                    router.push("/")
                }
            } else {
                router.refresh()
            }
        } catch (redirError) {
            console.error("Error during redirection:", redirError)
            router.refresh()
        }
    }

    const register = async (userData: any) => {
        const { email, password, name, lastname, role, businessName, region } = userData
        const fullName = `${name} ${lastname}`.trim()

        // 1. SignUp
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                }
            }
        })

        if (error) throw error
        if (!data.user) throw new Error("No se pudo crear el usuario")

        if (data.user && !data.session) {
            toast.success("Cuenta creada. Por favor verifica tu correo para iniciar sesión.")
            router.push("/login")
            return
        }

        try {
            // 2. Wait for Profile Creation (handled by DB trigger)
            let profileCreated = false
            // Poll for 5 seconds (10 attempts * 500ms)
            for (let i = 0; i < 10; i++) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user.id)
                    .single()

                if (profile) {
                    profileCreated = true
                    break
                }
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            if (!profileCreated) {
                console.warn("Profile not created by trigger within timeout. Attempting manual creation.")
                // Fallback: Manual creation if trigger fails
                await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        role: role
                    })
            }

            // 3. Create Provider Profile if needed
            if (role === 'provider') {
                const { error: providerError } = await supabase
                    .from('provider_profiles')
                    .insert({
                        id: data.user.id,
                        business_name: businessName,
                    })
                if (providerError) console.error("Provider profile error:", providerError)
            }

            toast.success("Cuenta creada exitosamente")

            if (role === 'provider') {
                router.push("/dashboard/provider")
            } else {
                router.push("/")
            }

        } catch (dbError) {
            console.error("Database error during registration:", dbError)
            // User is created in Auth but DB failed. 
        }
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            setUser(null)
            router.push("/")
            router.refresh()
        }
    }

    const updateProfile = (userData: Partial<User>) => {
        // Implementation for updating profile can be added later
        console.log("Update profile not yet fully implemented", userData)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                updateProfile,
                authError
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
