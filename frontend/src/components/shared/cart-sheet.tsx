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
    const { items, removeFromCart, updateQuantity, total, itemCount, eventPlan, setEventPlan } = useCart()
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
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-md md:max-w-lg border-l border-white/10 shadow-2xl h-full h-screen overflow-hidden bg-[#0F1216]/95 backdrop-blur-xl text-white">
                <SheetHeader className="px-6 py-4 border-b border-white/10 shrink-0">
                    <SheetTitle className="text-xl font-outfit font-bold flex items-center gap-2 text-white">
                        {eventPlan && !isPlanning ? "Carrito de Compras" : (eventPlan ? `Plan: ${eventPlan.eventName}` : "Tu Carrito")}
                    </SheetTitle>
                </SheetHeader>

                {itemCount === 0 && !eventPlan && !isPlanning && (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center bg-black/40">
                        <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-2 border border-white/10">
                            <Calendar className="h-8 w-8 text-white/40" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-outfit font-semibold text-white">Aún no tienes un plan</h3>
                            <p className="text-sm font-inter text-white/60 max-w-[220px] mx-auto">
                                Empieza a planificar tu evento configurando los detalles y el presupuesto.
                            </p>
                        </div>
                        <Button className="mt-4 ls-btn-cta" onClick={() => setIsPlanning(true)}>
                            Empezar Planificación
                        </Button>
                    </div>
                )}

                {((itemCount === 0 && isPlanning) || (eventPlan && isPlanning)) && (
                    <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar overflow-x-hidden">
                        <EventPlannerForm onComplete={() => setIsPlanning(false)} />
                    </div>
                )}

                {(eventPlan || itemCount > 0) && !isPlanning && (
                    <>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 custom-scrollbar">
                            {eventPlan && (
                                <div className="mb-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-outfit font-bold text-lg text-white">Mi Evento</h3>
                                            <p className="text-sm font-inter text-white/60 mt-0.5">
                                                {eventPlan.date ? format(new Date(eventPlan.date + "T00:00:00"), "EEE, d MMM yyyy", { locale: es }) : "Sin fecha"} • {eventPlan.guests || 0} Invitados
                                                <br />
                                                <span className="text-ls-cyan italic font-medium">
                                                    Venue: {eventPlan.requiresVenue ? (venueItem ? venueItem.title : "Buscando local...") : eventPlan.venueAddress}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsPlanning(true)}
                                                className="h-8 bg-black/40 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setEventPlan(null)}
                                                className="h-8 w-8 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                                title="Eliminar Evento"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between text-sm font-bold font-inter">
                                            <span className="text-white/80">Presupuesto: ${budget.toLocaleString()}</span>
                                            <span className={overBudget ? "text-red-400 font-outfit" : "text-ls-lemon font-outfit"}>
                                                Gastado: ${total.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.2)] ${overBudget ? 'bg-red-500 shadow-red-500/50' : 'bg-ls-cyan shadow-ls-cyan/50'}`}
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Separator className="mt-6 bg-white/10" />
                                </div>
                            )}

                            <div className="space-y-4 pb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-0 rounded-lg group relative border-b border-white/10 pb-4 last:border-0 hover:bg-white/5 p-2 transition-colors">
                                        {/* Thumbnail string */}
                                        <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-white/20">
                                                    <ShoppingCart className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-0.5">
                                            <div className="space-y-1 relative pr-8">
                                                <h4 className="font-outfit font-bold leading-tight line-clamp-1 text-base text-white">{item.title}</h4>
                                                <p className="text-sm font-inter text-white/50 line-clamp-1">
                                                    {item.description}
                                                </p>
                                                <div className="font-outfit font-bold text-lg mt-0.5 tracking-tight text-ls-lemon">
                                                    ${item.price.toLocaleString()}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-1 -right-2 h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors self-start"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Eliminar</span>
                                                </Button>
                                            </div>

                                            {/* Quantity Controls match screenshot: "Cantidad: - 1 +" */}
                                            <div className="flex items-center justify-end mt-2">
                                                <div className="flex items-center gap-1 font-inter">
                                                    <span className="text-[13px] text-white/60 mr-1">Cantidad:</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-white hover:bg-white/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || isVenueCategory(item.category)}
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-white hover:bg-white/10 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
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
                                    <div className="text-center py-10 mt-4 h-40 flex flex-col justify-center ls-glass bg-black/40 border-white/10 rounded-xl shrink-0">
                                        <p className="text-white/60 mb-4 text-sm font-inter">Agrega servicios increíbles a tu evento.</p>
                                        <SheetClose asChild>
                                            <Button variant="outline" className="mx-auto bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors">
                                                Explorar Catálogo
                                            </Button>
                                        </SheetClose>
                                    </div>
                                )}
                            </div>
                        </div>

                        {itemCount > 0 && (
                            <div className="border-t border-white/10 bg-[#0F1216]/95 backdrop-blur-md p-6 pt-5 space-y-5 shrink-0 z-10 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center justify-between text-base font-outfit font-bold text-white">
                                    <span className="text-xl">Total:</span>
                                    <span className="text-2xl tracking-tight text-ls-lemon">${total.toLocaleString()}<span className="text-base font-normal text-white/40">.00</span></span>
                                </div>
                                <SheetFooter>
                                    <SheetClose asChild>
                                        <Button className="w-full h-12 text-base font-inter font-bold rounded-xl ls-btn-cta shadow-xl shadow-ls-cyan/20" type="submit">
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
