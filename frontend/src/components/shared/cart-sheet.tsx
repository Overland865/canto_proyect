"use client"

import { ShoppingCart, Trash2, Calendar, Users, MapPin, Edit3, Plus, Minus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { Separator } from "@/components/ui/separator"
import { EventPlannerForm } from "@/components/shared/event-planner-form"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const isVenueCategory = (category?: string) => {
    if (!category) return false
    const cat = category.toLowerCase()
    return cat.includes("local") || cat.includes("salon") || cat.includes("salón")
}

export function CartSheet() {
    const { items, removeFromCart, updateQuantity, total, itemCount, eventPlan } = useCart()
    const [isPlanning, setIsPlanning] = useState(false)

    // Calculate budget progress
    const budget = eventPlan?.budget || 0
    const progressPercentage = budget > 0 ? Math.min((total / budget) * 100, 100) : 0
    const overBudget = total > budget && budget > 0

    const venueItem = items.find(i => isVenueCategory(i.category))

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] ring-2 ring-background"
                        >
                            {itemCount}
                        </Badge>
                    )}
                    <span className="sr-only">Open cart</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg border-l-2 shadow-2xl h-full h-screen overflow-hidden">
                <SheetHeader className="px-6 py-4 border-b shrink-0">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        {eventPlan && !isPlanning ? "Carrito de Compras" : (eventPlan ? `Plan: ${eventPlan.eventName}` : "Tu Carrito")}
                    </SheetTitle>
                </SheetHeader>

                {itemCount === 0 && !eventPlan && !isPlanning && (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center bg-slate-50/50 dark:bg-slate-900/10">
                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                            <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-foreground">Aún no tienes un plan</h3>
                            <p className="text-sm text-muted-foreground max-w-[220px] mx-auto">
                                Empieza a planificar tu evento configurando los detalles y el presupuesto.
                            </p>
                        </div>
                        <Button className="mt-4" onClick={() => setIsPlanning(true)}>
                            Empezar Planificación
                        </Button>
                    </div>
                )}

                {((itemCount === 0 && isPlanning) || (eventPlan && isPlanning)) && (
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <EventPlannerForm onComplete={() => setIsPlanning(false)} />
                    </div>
                )}

                {(eventPlan || itemCount > 0) && !isPlanning && (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                            {eventPlan && (
                                <div className="mb-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">Mi Evento</h3>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {eventPlan.date ? format(new Date(eventPlan.date + "T00:00:00"), "EEE, d MMM yyyy", { locale: es }) : "Sin fecha"} • {eventPlan.guests || 0} Invitados
                                                <br />
                                                <span className="text-emerald-600 dark:text-emerald-400 italic font-medium">
                                                    Venue: {eventPlan.requiresVenue ? (venueItem ? venueItem.title : "Buscando local...") : eventPlan.venueAddress}
                                                </span>
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsPlanning(true)}
                                            className="h-8 shadow-sm flex-shrink-0 ml-2"
                                        >
                                            Editar
                                        </Button>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>Presupuesto: ${budget.toLocaleString()}</span>
                                            <span className={overBudget ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}>
                                                Gastado: ${total.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${overBudget ? 'bg-red-500' : 'bg-emerald-500 dark:bg-emerald-400'}`}
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Separator className="mt-6" />
                                </div>
                            )}

                            <div className="space-y-4 pb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-0 rounded-lg bg-transparent group relative border-b border-border/50 pb-4 last:border-0">
                                        {/* Thumbnail string */}
                                        <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl border bg-slate-100 dark:bg-slate-800">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                    <ShoppingCart className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-0.5">
                                            <div className="space-y-1 relative pr-8">
                                                <h4 className="font-bold leading-tight line-clamp-1 text-base">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {item.description}
                                                </p>
                                                <div className="font-bold text-sm mt-0.5 tracking-tight">
                                                    ${item.price.toLocaleString()}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-1 -right-2 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 self-start"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>

                                            {/* Quantity Controls match screenshot: "Cantidad: - 1 +" */}
                                            <div className="flex items-center justify-end mt-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[13px] text-foreground mr-1">Cantidad:</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-30"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || isVenueCategory(item.category)}
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md disabled:opacity-30"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={isVenueCategory(item.category)}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {itemCount === 0 && eventPlan && (
                                    <div className="text-center py-10 mt-4 h-40 flex flex-col justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed shrink-0">
                                        <p className="text-muted-foreground mb-4 text-sm font-medium">Agrega servicios increíbles a tu evento.</p>
                                        <SheetClose asChild>
                                            <Button variant="outline" className="mx-auto bg-transparent">
                                                Explorar Catálogo
                                            </Button>
                                        </SheetClose>
                                    </div>
                                )}
                            </div>
                        </div>

                        {itemCount > 0 && (
                            <div className="border-t bg-background p-6 pt-5 space-y-5 shrink-0 z-10 shadow-[0_-15px_15px_-15px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center justify-between text-base font-bold text-foreground">
                                    <span className="text-xl">Total:</span>
                                    <span className="text-2xl tracking-tight">${total.toLocaleString()}<span className="text-base font-normal text-muted-foreground">.00</span></span>
                                </div>
                                <SheetFooter>
                                    <SheetClose asChild>
                                        <Button className="w-full h-12 text-base font-medium rounded-xl border mt-2" type="submit">
                                            Pagar Ahora
                                        </Button>
                                    </SheetClose>
                                </SheetFooter>
                            </div>
                        )}
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
