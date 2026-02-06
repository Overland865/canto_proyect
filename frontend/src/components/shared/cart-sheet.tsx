"use client"

import { ShoppingCart, Trash2 } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { Separator } from "@/components/ui/separator"

export function CartSheet() {
    const { items, removeFromCart, total, itemCount } = useCart()

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
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg border-l-2 shadow-2xl">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Tu Carrito
                    </SheetTitle>
                </SheetHeader>

                {itemCount === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center bg-slate-50/50">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                            <ShoppingCart className="h-8 w-8 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-slate-900">Tu carrito está vacío</h3>
                            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                                Explora nuestros servicios y añade los que más te gusten para tu evento.
                            </p>
                        </div>
                        <SheetClose asChild>
                            <Button variant="outline" className="mt-4">
                                Volver al Catálogo
                            </Button>
                        </SheetClose>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6 py-4">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-slate-50 transition-colors group">
                                        {/* Thumbnail placeholder or real image if item has it */}
                                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-slate-100">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                    <ShoppingCart className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold leading-tight line-clamp-1">{item.title}</h4>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 bg-slate-100 rounded-md px-2 py-1">
                                                    <span className="text-xs text-muted-foreground font-medium">Cant: {item.quantity}</span>
                                                </div>
                                                <div className="text-sm font-bold text-primary">
                                                    ${(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50 self-start -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Eliminar</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="border-t bg-slate-50/80 p-6 space-y-4 backdrop-blur-sm">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({itemCount} ítems)</span>
                                    <span>${total.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-base font-bold">
                                    <span>Total a Pagar</span>
                                    <span className="text-xl text-primary">${total.toLocaleString()}</span>
                                </div>
                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button className="w-full h-12 text-base shadow-lg shadow-primary/20" type="submit">
                                        Proceder al Pago
                                    </Button>
                                </SheetClose>
                            </SheetFooter>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
