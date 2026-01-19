"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type User = {
    name: string
    lastname: string
    email: string
    role: "client" | "provider"
    businessName?: string
    region?: string
}

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    login: (userData: User) => void
    register: (userData: User) => void
    logout: () => void
    updateProfile: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Load from localStorage on mount
        const storedUser = localStorage.getItem("mock_user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const login = (userData: User) => {
        setUser(userData)
        localStorage.setItem("mock_user", JSON.stringify(userData))

        if (userData.role === 'provider') {
            router.push("/dashboard/provider")
        } else {
            router.push("/")
        }
    }

    const register = (userData: User) => {
        setUser(userData)
        localStorage.setItem("mock_user", JSON.stringify(userData))

        if (userData.role === 'provider') {
            router.push("/dashboard/provider")
        } else {
            router.push("/")
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("mock_user")
        router.push("/")
    }

    const updateProfile = (updatedData: Partial<User>) => {
        if (user) {
            const newUser = { ...user, ...updatedData }
            setUser(newUser)
            localStorage.setItem("mock_user", JSON.stringify(newUser))
        }
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
