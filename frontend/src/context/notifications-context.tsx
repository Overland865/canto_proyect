"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { listenToNotifications } from "@/lib/supabase-service"
import { toast } from "sonner"

interface Notification {
    id: string
    user_id: string
    title: string
    message: string
    type: string
    read: boolean
    created_at: string
}

interface NotificationsContextType {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const supabase = createClient()

    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        if (!user) return

        // 1. Fetch initial notifications
        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) setNotifications(data)
        }

        fetchNotifications()

        // 2. Listen to real-time updates
        const unsubscribe = listenToNotifications(supabase, user.id, (payload: any) => {
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev])

            // Show toast for new notification
            toast(newNotification.title, {
                description: newNotification.message,
                action: {
                    label: "Ver",
                    onClick: () => console.log("Navigate to notification")
                }
            })
        })

        return () => {
            unsubscribe()
        }
    }, [user, supabase])

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            )
        }
    }

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationsContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationsProvider")
    }
    return context
}
