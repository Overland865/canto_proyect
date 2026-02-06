"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User as UserIcon, Home } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { CartSheet } from "@/components/shared/cart-sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Home className="h-6 w-6" />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {user?.role === 'provider' ? (
              <Link
                href="/dashboard/provider"
                className="transition-colors hover:text-foreground/80 text-foreground font-bold text-primary"
              >
                Ir a mi Panel
              </Link>
            ) : (
              <>
                <Link
                  href="/marketplace"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Catálogo
                </Link>
                <Link
                  href="/providers"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Proveedor
                </Link>
              </>
            )}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center">
              <span className="font-bold">Local_Space</span>
            </Link>
            <nav className="flex flex-col gap-4 mt-4">
              {user?.role === 'provider' ? (
                <Link
                  href="/dashboard/provider"
                  className="block px-2 py-1 text-lg font-bold text-primary"
                >
                  Ir a mi Panel
                </Link>
              ) : (
                <>
                  <Link
                    href="/marketplace"
                    className="block px-2 py-1 text-lg"
                  >
                    Catálogo
                  </Link>
                  <Link
                    href="/providers"
                    className="block px-2 py-1 text-lg"
                  >
                    Proveedor
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search bar could go here or be hidden on mobile */}
          </div>
          <nav className="flex items-center gap-2">
            <CartSheet />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name} {user?.lastname}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={user?.role === 'provider' ? "/dashboard/provider/settings" : "/dashboard/user/profile"}>
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={user?.role === 'provider' ? "/dashboard/provider" : "/dashboard/user"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
