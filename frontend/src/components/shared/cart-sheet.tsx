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
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs"
                        >
                            {itemCount}
                        </Badge>
                    )}
                    <span className="sr-only">Open cart</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>Carrito de Compras ({itemCount})</SheetTitle>
                </SheetHeader>
                <Separator className="my-4" />
                {itemCount === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-2">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        <span className="text-lg font-medium text-muted-foreground">Tu carrito está vacío</span>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 pr-6">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex space-x-4">
                                        <div className="flex flex-1 flex-col space-y-1">
                                            <span className="font-medium leading-none">{item.title}</span>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {item.description}
                                            </p>
                                            <div className="text-sm text-muted-foreground">
                                                Cantidad: {item.quantity} x ${item.price}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <span className="font-medium">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="space-y-4 pr-6 pt-4">
                            <Separator />
                            <div className="flex items-center justify-between font-medium">
                                <span>Total</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button className="w-full" type="submit">
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
