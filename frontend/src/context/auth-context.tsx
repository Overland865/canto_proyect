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
    role: "consumer" | "provider" | "admin"
    status?: string // Added status
    businessName?: string
    region?: string
}

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    login: (params: any) => Promise<void>
    register: (params: any) => Promise<{ needsVerification: boolean; email?: string } | void>
    logout: () => Promise<void>
    updateProfile: (userData: Partial<User>) => void
    authError: string | null
    verifyOtp: (email: string, token: string, type: "signup" | "email") => Promise<void>
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
                // Default status for new users can be handled here or by DB default
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
                    .select('business_name, status')
                    .eq('id', userId)
                    .maybeSingle()

                if (providerError) {
                    console.warn("Error fetching provider profile:", providerError)
                }

                if (providerData) {
                    extendedUser.businessName = providerData.business_name
                    extendedUser.status = providerData.status
                }
            }

            setUser(extendedUser)
        } catch (error: any) {
            console.error("Error fetching profile:", error)
            setAuthError("Profile Fetch Error: " + (error.message || JSON.stringify(error)))
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

                if (profile?.role === 'admin') {
                    // Standardized Admin Dashboard Route
                    router.push("/dashboard/admin")
                } else if (profile?.role === 'provider') {
                    // Fetch provider status
                    const { data: providerProfile } = await supabase
                        .from('provider_profiles')
                        .select('status')
                        .eq('id', data.user.id)
                        .maybeSingle()

                    if (providerProfile?.status === 'pending') {
                        toast.warning("Tu cuenta está pendiente de aprobación.", {
                            description: "Te notificaremos cuando un administrador apruebe tu negocio."
                        })
                        // Redirect to home or a status page
                        router.push("/")
                    } else if (providerProfile?.status === 'approved') {
                        router.push("/dashboard/provider")
                    } else if (providerProfile?.status === 'rejected') {
                        toast.error("Tu cuenta ha sido rechazada.")
                        await logout()
                    } else {
                        // Fallback for new providers or other statuses
                        router.push("/dashboard/provider")
                    }
                } else {
                    // Consumers go to Marketplace
                    router.push("/marketplace")
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

        // Store metadata for later profile creation if verifying
        if (data.user && !data.session) {
            // Email confirmation enabled.
            // We return here to let the UI show the verification step.
            return { needsVerification: true, email: email }
        }

        try {
            await handleProfileCreation(data.user.id, email, fullName, role, businessName)

            toast.success("Cuenta creada exitosamente")

            if (role === 'provider') {
                // New providers are pending by default
                toast.info("Tu solicitud de proveedor ha sido enviada.", {
                    description: "Un administrador revisará tu cuenta pronto."
                })
                router.push("/")
            } else {
                router.push("/")
            }
            return { needsVerification: false }

        } catch (dbError) {
            console.error("Database error during registration:", dbError)
            // User created in Auth but DB setup failed
        }
    }

    const verifyOtp = async (email: string, token: string, type: "signup" | "email" = "signup") => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type
        })

        if (error) throw error

        if (data.session && data.user) {
            // Ensure profile exists after verification
            const fullName = data.user.user_metadata.full_name || "Usuario"
            const role = data.user.user_metadata.role || "consumer"
            const businessName = data.user.user_metadata.business_name // Might not be there if not passed in meta

            await handleProfileCreation(data.user.id, data.user.email!, fullName, role) // businessName might need extra handling but profile usually created by trigger

            toast.success("Correo verificado exitosamente")
            if (role === 'provider') {
                router.push("/dashboard/provider")
            } else {
                router.push("/")
            }
        }
    }

    const handleProfileCreation = async (userId: string, email: string, fullName: string, role: string, businessName?: string) => {
        // 2. Wait for Profile Creation (handled by DB trigger)
        let profileCreated = false
        // Poll for 3 seconds (15 attempts * 200ms)
        for (let i = 0; i < 15; i++) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .single()

            if (profile) {
                profileCreated = true
                break
            }
            await new Promise(resolve => setTimeout(resolve, 200)) // Reduced wait time
        }

        if (!profileCreated) {
            console.warn("Profile not created by trigger within timeout. Attempting manual creation.")
            // Fallback: Manual creation if trigger fails
            await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: email,
                    full_name: fullName,
                    role: role
                })
        }

        // 3. Create Provider Profile if needed
        if (role === 'provider') {
            // Check if already exists
            const { data: existing } = await supabase.from('provider_profiles').select('id').eq('id', userId).single()

            if (!existing) {
                const { error: providerError } = await supabase
                    .from('provider_profiles')
                    .insert({
                        id: userId,
                        business_name: businessName || "Negocio sin nombre",
                    })
                if (providerError) console.error("Provider profile error:", providerError)
            }
        }
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            setUser(null)
            router.push("/login")
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
                authError,
                verifyOtp
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
