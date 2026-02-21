"use client"

import { Bell } from "lucide-react"
import { useNotifications } from "@/context/notifications-context"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications()

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Bell className="h-[1.2rem] w-[1.2rem]" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="flex flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                        <h4 className="text-sm font-semibold">Notificaciones</h4>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                            {unreadCount} sin leer
                        </span>
                    </div>
                    <ScrollArea className="max-h-[400px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Bell className="h-10 w-10 text-muted-foreground/20 mb-2" />
                                <p className="text-sm text-muted-foreground">No tienes notificaciones aún</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => !n.read && markAsRead(n.id)}
                                        className={cn(
                                            "flex flex-col gap-1 p-4 text-left transition-colors hover:bg-muted/50 border-b last:border-0",
                                            !n.read && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className={cn(
                                                "text-sm font-semibold leading-none",
                                                !n.read && "text-primary"
                                            )}>
                                                {n.title}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: es })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {n.message}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    <div className="border-t p-2">
                        <Button variant="ghost" className="w-full text-xs" size="sm">
                            Ver todas las notificaciones
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
