"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User as UserIcon, Home } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { CartSheet } from "@/components/shared/cart-sheet"
import { NotificationBell } from "@/components/shared/notification-bell"
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
    // Style Update V2: Azul Marino (Navy) Background
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(220,55%,12%)] bg-[hsl(220,55%,18%)] text-white shadow-md">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <img src="/logo-icon.svg" alt="Local Space" className="h-8 w-auto drop-shadow-sm" />
            <span className="font-bold text-white hidden sm:inline-block text-xl tracking-tight">
              Local<span className="text-primary ml-1">Space</span>
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {user?.role === 'provider' ? (
              <Link
                href="/dashboard/provider"
                className="transition-colors hover:text-primary text-white font-bold"
              >
                Ir a mi Panel
              </Link>
            ) : (
              <>
                <Link
                  href="/marketplace"
                  className="transition-colors hover:text-primary text-white/80"
                >
                  Catálogo
                </Link>
                <Link
                  href="/providers"
                  className="transition-colors hover:text-primary text-white/80"
                >
                  Proveedor
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base md:hidden text-white hover:bg-white/10 hover:text-primary"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 bg-[hsl(220,55%,18%)] border-r border-[hsl(220,55%,12%)] text-white">
            <Link href="/" className="flex items-center space-x-2 text-white bg-white/5 p-2 rounded-md">
              <img src="/logo-icon.svg" alt="Local Space" className="h-6 w-auto drop-shadow-sm" />
              <span className="font-bold tracking-tight text-lg">
                Local<span className="text-primary ml-1">Space</span>
              </span>
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
                    className="block px-2 py-1 text-lg text-white/80 hover:text-primary"
                  >
                    Catálogo
                  </Link>
                  <Link
                    href="/providers"
                    className="block px-2 py-1 text-lg text-white/80 hover:text-primary"
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
            {/* Search bar placeholder */}
          </div>
          <nav className="flex items-center gap-2">
            <NotificationBell />
            <CartSheet />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src="/avatars/01.png" alt={user?.name} />
                      <AvatarFallback className="bg-primary text-white font-bold border border-white/20">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[hsl(220,55%,18%)] text-white border border-[hsl(220,55%,12%)]" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user?.name} {user?.lastname}</p>
                      <p className="text-xs leading-none text-white/60">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-primary text-white cursor-pointer">
                    <Link href={user?.role === 'provider' ? "/dashboard/provider/settings" : "/dashboard/user/profile"}>
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-primary text-white cursor-pointer">
                    <Link href={user?.role === 'provider' ? "/dashboard/provider" : "/dashboard/user"}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="focus:bg-red-500/20 focus:text-red-400 text-red-300 cursor-pointer">
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-primary">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm">
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
